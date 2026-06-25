"use server";

import { createAuditLog } from "@/lib/audit";
import {
  ARTIST_ANNUAL_PRODUCT_KEY,
  ensureArtistAccountForCheckout,
} from "@/lib/artist-billing";
import { getAppBaseUrl, getEnv } from "@/lib/env";
import { getStripeClient, stripePriceEnv } from "@/lib/stripe";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export type ArtistSignupValues = {
  legal_name?: string;
  artist_name?: string;
  email?: string;
  email_confirmation?: string;
  phone_country_code?: string;
  phone_number?: string;
  country?: string;
  genre?: string;
  bio?: string;
};

export type ArtistSignupState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ArtistSignupValues | "password", string>>;
  values?: ArtistSignupValues;
  checkoutClientSecret?: string;
  checkoutSessionId?: string;
};

export async function createArtistAccountAction(
  _previousState: ArtistSignupState,
  formData: FormData,
): Promise<ArtistSignupState> {
  const values: ArtistSignupValues = {
    legal_name: clean(formData.get("legal_name")),
    artist_name: clean(formData.get("artist_name")),
    email: clean(formData.get("email"))?.toLowerCase(),
    email_confirmation: clean(formData.get("email_confirmation"))?.toLowerCase(),
    phone_country_code: clean(formData.get("phone_country_code")) ?? "+509",
    phone_number: clean(formData.get("phone_number")),
    country: clean(formData.get("country")),
    genre: clean(formData.get("genre")),
    bio: clean(formData.get("bio")),
  };
  const password = String(formData.get("password") ?? "");
  const fieldErrors = validateSignup(values, password);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Completa los campos marcados para crear tu cuenta.",
      fieldErrors,
      values,
    };
  }

  if (!getEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")) {
    return {
      error:
        "Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local para abrir el pago dentro de la plataforma.",
      values,
    };
  }

  const serviceSupabase = createServiceSupabaseClient();
  const serverSupabase = await createServerSupabaseClient();

  if (!serviceSupabase || !serverSupabase) {
    return {
      error:
        "Supabase no está configurado para crear cuentas. Revisa las variables de entorno.",
      values,
    };
  }

  const phone = buildPhone(values);
  const { data: created, error: createError } =
    await serviceSupabase.auth.admin.createUser({
      email: values.email!,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: values.legal_name,
        artist_name: values.artist_name,
        user_type: "artist",
        phone,
        country: values.country,
      },
    });

  if (createError || !created.user) {
    return {
      error: getCreateAccountError(createError?.message),
      values,
    };
  }

  const userId = created.user.id;
  const account = await ensureArtistAccountForCheckout({
    userId,
    email: values.email,
    fullName: values.legal_name,
  });

  if (!account.ok) {
    await createAuditLog({
      actorId: userId,
      action: "artist_signup.create",
      entityType: "artist_profiles",
      entityId: userId,
      outcome: "failure",
      metadata: {
        reason: account.reason,
      },
    });

    return {
      error: "La cuenta se creó, pero no se pudo preparar como artista.",
      values,
    };
  }

  const profilePayload = {
    user_id: userId,
    legal_name: values.legal_name,
    artist_name: values.artist_name,
    country: values.country,
    phone,
    bio: values.bio,
    genre: values.genre,
    status: "pending_payment",
  };

  const [{ error: profileError }, { error: artistProfileError }] =
    await Promise.all([
      serviceSupabase.from("profiles").upsert(
        {
          id: userId,
          email: values.email,
          full_name: values.legal_name,
          user_type: "artist",
          status: "active",
        },
        { onConflict: "id" },
      ),
      serviceSupabase.from("artist_profiles").upsert(profilePayload, {
        onConflict: "user_id",
      }),
    ]);

  if (profileError || artistProfileError) {
    await createAuditLog({
      actorId: userId,
      action: "artist_signup.profile_prepare",
      entityType: "artist_profiles",
      entityId: userId,
      outcome: "failure",
      after: profilePayload,
      metadata: {
        profileError: profileError?.message,
        artistProfileError: artistProfileError?.message,
      },
    });

    return {
      error: "La cuenta se creó, pero no se pudo guardar el perfil artístico.",
      values,
    };
  }

  await createAuditLog({
    actorId: userId,
    action: "artist_signup.create",
    entityType: "artist_profiles",
    entityId: userId,
    outcome: "success",
    after: profilePayload,
    metadata: {
      source: "public_artist_signup",
    },
  });

  const { error: signInError } = await serverSupabase.auth.signInWithPassword({
    email: values.email!,
    password,
  });

  if (signInError) {
    return {
      error:
        "Tu cuenta fue creada. Entra al dashboard con tu correo y contraseña para continuar el pago.",
      values,
    };
  }

  const checkout = await createEmbeddedArtistAnnualCheckout({
    userId,
    email: values.email!,
  });

  if (!checkout.ok) {
    await createAuditLog({
      actorId: userId,
      action: "stripe.checkout_session.create",
      entityType: "artist_subscriptions",
      outcome: "failure",
      metadata: {
        product: ARTIST_ANNUAL_PRODUCT_KEY,
        reason: checkout.reason,
      },
    });

    return {
      error:
        checkout.reason === "stripe_not_configured"
          ? "La cuenta fue creada, pero Stripe no está configurado para abrir el pago aquí."
          : "La cuenta fue creada, pero no se pudo preparar el pago anual. Intenta desde billing.",
      values,
    };
  }

  await createAuditLog({
    actorId: userId,
    action: "stripe.checkout_session.create",
    entityType: "artist_subscriptions",
    entityId: checkout.sessionId,
    outcome: "success",
    after: {
      mode: "subscription",
      uiMode: "embedded_page",
    },
    metadata: {
      product: ARTIST_ANNUAL_PRODUCT_KEY,
      priceEnv: stripePriceEnv.artistAnnual,
      source: "public_artist_signup",
    },
  });

  return {
    values,
    checkoutClientSecret: checkout.clientSecret,
    checkoutSessionId: checkout.sessionId,
  };
}

function validateSignup(values: ArtistSignupValues, password: string) {
  const errors: ArtistSignupState["fieldErrors"] = {};

  if (!values.legal_name) {
    errors.legal_name = "Escribe tu nombre real.";
  }

  if (!values.artist_name) {
    errors.artist_name = "Escribe tu nombre artístico.";
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Escribe un correo válido.";
  }

  if (values.email !== values.email_confirmation) {
    errors.email_confirmation = "Los correos no coinciden.";
  }

  if (password.length < 8) {
    errors.password = "La contraseña debe tener mínimo 8 caracteres.";
  }

  if (!values.phone_number) {
    errors.phone_number = "Escribe tu número de teléfono.";
  }

  return errors;
}

async function createEmbeddedArtistAnnualCheckout({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; clientSecret: string; sessionId: string }
  | { ok: false; reason: "stripe_not_configured" | "missing_client_secret" }
> {
  const stripe = getStripeClient();
  const priceId = getEnv(stripePriceEnv.artistAnnual);

  if (!stripe || !priceId) {
    return { ok: false, reason: "stripe_not_configured" };
  }

  const appBaseUrl = getAppBaseUrl();
  const metadata = {
    product: ARTIST_ANNUAL_PRODUCT_KEY,
    user_id: userId,
  };

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    mode: "subscription",
    client_reference_id: userId,
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata,
    subscription_data: {
      metadata,
    },
    return_url: `${appBaseUrl}/artist?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
  });

  if (!session.client_secret) {
    return { ok: false, reason: "missing_client_secret" };
  }

  return {
    ok: true,
    clientSecret: session.client_secret,
    sessionId: session.id,
  };
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

function buildPhone(values: ArtistSignupValues) {
  const code = values.phone_country_code?.trim() || "+509";
  const number = (values.phone_number ?? "")
    .replace(/[^\d\s().-]/g, "")
    .trim();

  return number ? `${code} ${number}` : null;
}

function getCreateAccountError(message?: string) {
  const lowerMessage = message?.toLowerCase() ?? "";

  if (
    lowerMessage.includes("already") ||
    lowerMessage.includes("registered") ||
    lowerMessage.includes("exists")
  ) {
    return "Ese correo ya tiene cuenta. Entra al dashboard con ese correo.";
  }

  return "No se pudo crear la cuenta artista. Revisa los datos e intenta otra vez.";
}
