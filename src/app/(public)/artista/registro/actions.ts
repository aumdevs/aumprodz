"use server";

import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import {
  ARTIST_ANNUAL_PRODUCT_KEY,
  ensureArtistAccountForCheckout,
} from "@/lib/artist-billing";
import { getAppBaseUrl, getEnv } from "@/lib/env";
import { normalizeLocale, type AppLocale } from "@/lib/i18n/config";
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
};

export async function createArtistAccountAction(
  _previousState: ArtistSignupState,
  formData: FormData,
): Promise<ArtistSignupState> {
  const locale = normalizeLocale(String(formData.get("locale") ?? "")) ?? "ht";
  const copy = signupActionCopy[locale];
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
  const fieldErrors = validateSignup(values, password, copy);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: copy.completeMarkedFields,
      fieldErrors,
      values,
    };
  }

  const serviceSupabase = createServiceSupabaseClient();
  const serverSupabase = await createServerSupabaseClient();

  if (!serviceSupabase || !serverSupabase) {
    return {
      error: copy.supabaseNotConfigured,
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
      error: getCreateAccountError(createError?.message, copy),
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
      error: copy.artistPrepareFailed,
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
      error: copy.artistProfileSaveFailed,
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
      error: copy.accountCreatedLoginToPay,
      values,
    };
  }

  const checkout = await createHostedArtistAnnualCheckout({
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
        message: checkout.message ?? null,
      },
    });

    return {
      error:
        checkout.reason === "stripe_not_configured"
          ? copy.stripeNotConfigured
          : copy.checkoutPrepareFailed,
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
      uiMode: "hosted_page",
    },
    metadata: {
      product: ARTIST_ANNUAL_PRODUCT_KEY,
      priceEnv: stripePriceEnv.artistAnnual,
      source: "public_artist_signup",
    },
  });

  redirect(checkout.url);
}

const signupActionCopy: Record<
  AppLocale,
  {
    completeMarkedFields: string;
    missingStripePublicKey: string;
    supabaseNotConfigured: string;
    legalNameRequired: string;
    artistNameRequired: string;
    emailInvalid: string;
    emailsMismatch: string;
    passwordShort: string;
    phoneRequired: string;
    emailAlreadyExists: string;
    createAccountFailed: string;
    artistPrepareFailed: string;
    artistProfileSaveFailed: string;
    accountCreatedLoginToPay: string;
    stripeNotConfigured: string;
    checkoutPrepareFailed: string;
  }
> = {
  ht: {
    completeMarkedFields: "Ranpli chan ki make yo pou kreye kont ou.",
    missingStripePublicKey:
      "Stripe poko konfigire pou ouvri peman an. Kontakte sipò.",
    supabaseNotConfigured:
      "Sistèm kont lan poko konfigire. Kontakte sipò.",
    legalNameRequired: "Ekri non legal ou.",
    artistNameRequired: "Ekri non atis ou.",
    emailInvalid: "Ekri yon imèl ki valab.",
    emailsMismatch: "Imèl yo pa menm.",
    passwordShort: "Modpas la dwe gen omwen 8 karaktè.",
    phoneRequired: "Ekri nimewo telefòn ou.",
    emailAlreadyExists: "Imèl sa a deja gen kont. Antre nan dashboard la ak imèl sa a.",
    createAccountFailed: "Nou pa t kapab kreye kont atis la. Verifye done yo epi eseye ankò.",
    artistPrepareFailed: "Kont lan kreye, men nou pa t kapab prepare l kòm kont atis.",
    artistProfileSaveFailed: "Kont lan kreye, men nou pa t kapab sove pwofil atistik la.",
    accountCreatedLoginToPay:
      "Kont ou kreye. Antre nan dashboard la ak imèl ak modpas ou pou kontinye peman an.",
    stripeNotConfigured:
      "Kont lan kreye, men Stripe poko konfigire pou ouvri peman an.",
    checkoutPrepareFailed:
      "Kont lan kreye, men nou pa t kapab prepare peman anyèl la. Antre nan dashboard la epi eseye nan Peman.",
  },
  es: {
    completeMarkedFields: "Completa los campos marcados para crear tu cuenta.",
    missingStripePublicKey:
      "Stripe no está configurado para abrir el pago. Contacta soporte.",
    supabaseNotConfigured:
      "Supabase no está configurado para crear cuentas. Revisa las variables de entorno.",
    legalNameRequired: "Escribe tu nombre real.",
    artistNameRequired: "Escribe tu nombre artístico.",
    emailInvalid: "Escribe un correo válido.",
    emailsMismatch: "Los correos no coinciden.",
    passwordShort: "La contraseña debe tener mínimo 8 caracteres.",
    phoneRequired: "Escribe tu número de teléfono.",
    emailAlreadyExists: "Ese correo ya tiene cuenta. Entra al dashboard con ese correo.",
    createAccountFailed: "No se pudo crear la cuenta artista. Revisa los datos e intenta otra vez.",
    artistPrepareFailed: "La cuenta se creó, pero no se pudo preparar como artista.",
    artistProfileSaveFailed: "La cuenta se creó, pero no se pudo guardar el perfil artístico.",
    accountCreatedLoginToPay:
      "Tu cuenta fue creada. Entra al dashboard con tu correo y contraseña para continuar el pago.",
    stripeNotConfigured:
      "La cuenta fue creada, pero Stripe no está configurado para abrir el pago aquí.",
    checkoutPrepareFailed:
      "La cuenta fue creada, pero no se pudo preparar el pago anual. Entra al dashboard y prueba desde Pagos.",
  },
  en: {
    completeMarkedFields: "Complete the marked fields to create your account.",
    missingStripePublicKey:
      "Stripe is not configured to open payment. Contact support.",
    supabaseNotConfigured:
      "Account creation is not configured. Contact support.",
    legalNameRequired: "Enter your legal name.",
    artistNameRequired: "Enter your artist name.",
    emailInvalid: "Enter a valid email.",
    emailsMismatch: "The emails do not match.",
    passwordShort: "The password must be at least 8 characters.",
    phoneRequired: "Enter your phone number.",
    emailAlreadyExists: "That email already has an account. Sign in to the dashboard with it.",
    createAccountFailed: "The artist account could not be created. Check the data and try again.",
    artistPrepareFailed: "The account was created, but it could not be prepared as an artist account.",
    artistProfileSaveFailed: "The account was created, but the artist profile could not be saved.",
    accountCreatedLoginToPay:
      "Your account was created. Sign in with your email and password to continue payment.",
    stripeNotConfigured:
      "The account was created, but Stripe is not configured to open payment.",
    checkoutPrepareFailed:
      "The account was created, but annual payment could not be prepared. Enter the dashboard and try from Payments.",
  },
  fr: {
    completeMarkedFields: "Complétez les champs indiqués pour créer votre compte.",
    missingStripePublicKey:
      "Stripe n'est pas configuré pour ouvrir le paiement. Contactez le support.",
    supabaseNotConfigured:
      "La création de compte n'est pas configurée. Contactez le support.",
    legalNameRequired: "Entrez votre nom légal.",
    artistNameRequired: "Entrez votre nom d'artiste.",
    emailInvalid: "Entrez un email valide.",
    emailsMismatch: "Les emails ne correspondent pas.",
    passwordShort: "Le mot de passe doit contenir au moins 8 caractères.",
    phoneRequired: "Entrez votre numéro de téléphone.",
    emailAlreadyExists: "Cet email a déjà un compte. Connectez-vous au dashboard avec cet email.",
    createAccountFailed: "Le compte artiste n'a pas pu être créé. Vérifiez les données et réessayez.",
    artistPrepareFailed: "Le compte a été créé, mais il n'a pas pu être préparé comme compte artiste.",
    artistProfileSaveFailed: "Le compte a été créé, mais le profil artiste n'a pas pu être enregistré.",
    accountCreatedLoginToPay:
      "Votre compte a été créé. Connectez-vous avec votre email et mot de passe pour continuer le paiement.",
    stripeNotConfigured:
      "Le compte a été créé, mais Stripe n'est pas configuré pour ouvrir le paiement.",
    checkoutPrepareFailed:
      "Le compte a été créé, mais le paiement annuel n'a pas pu être préparé. Entrez dans le dashboard et essayez depuis Paiements.",
  },
  pt: {
    completeMarkedFields: "Preencha os campos marcados para criar sua conta.",
    missingStripePublicKey:
      "A Stripe não está configurada para abrir o pagamento. Contate o suporte.",
    supabaseNotConfigured:
      "A criação de conta não está configurada. Contate o suporte.",
    legalNameRequired: "Escreva seu nome legal.",
    artistNameRequired: "Escreva seu nome artístico.",
    emailInvalid: "Escreva um email válido.",
    emailsMismatch: "Os emails não coincidem.",
    passwordShort: "A senha deve ter no mínimo 8 caracteres.",
    phoneRequired: "Escreva seu número de telefone.",
    emailAlreadyExists: "Esse email já tem conta. Entre no dashboard com esse email.",
    createAccountFailed: "Não foi possível criar a conta de artista. Revise os dados e tente de novo.",
    artistPrepareFailed: "A conta foi criada, mas não pôde ser preparada como conta de artista.",
    artistProfileSaveFailed: "A conta foi criada, mas o perfil artístico não pôde ser salvo.",
    accountCreatedLoginToPay:
      "Sua conta foi criada. Entre com seu email e senha para continuar o pagamento.",
    stripeNotConfigured:
      "A conta foi criada, mas a Stripe não está configurada para abrir o pagamento.",
    checkoutPrepareFailed:
      "A conta foi criada, mas não foi possível preparar o pagamento anual. Entre no dashboard e tente em Pagamentos.",
  },
};

function validateSignup(
  values: ArtistSignupValues,
  password: string,
  copy: (typeof signupActionCopy)[AppLocale],
) {
  const errors: ArtistSignupState["fieldErrors"] = {};

  if (!values.legal_name) {
    errors.legal_name = copy.legalNameRequired;
  }

  if (!values.artist_name) {
    errors.artist_name = copy.artistNameRequired;
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = copy.emailInvalid;
  }

  if (values.email !== values.email_confirmation) {
    errors.email_confirmation = copy.emailsMismatch;
  }

  if (password.length < 8) {
    errors.password = copy.passwordShort;
  }

  if (!values.phone_number) {
    errors.phone_number = copy.phoneRequired;
  }

  return errors;
}

async function createHostedArtistAnnualCheckout({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; url: string; sessionId: string }
  | {
      ok: false;
      reason: "stripe_not_configured" | "missing_checkout_url" | "stripe_error";
      message?: string;
    }
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

  const session = await stripe.checkout.sessions
    .create({
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
      success_url: `${appBaseUrl}/artist?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/artista/registro?checkout=cancelled`,
      allow_promotion_codes: true,
    })
    .catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unknown Stripe checkout error";
      console.error("Artist signup Stripe checkout failed", {
        userId,
        priceEnv: stripePriceEnv.artistAnnual,
        message,
      });

      return { errorMessage: message };
    });

  if ("errorMessage" in session) {
    return { ok: false, reason: "stripe_error", message: session.errorMessage };
  }

  if (!session.url) {
    return { ok: false, reason: "missing_checkout_url" };
  }

  return {
    ok: true,
    url: session.url,
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

function getCreateAccountError(
  message: string | undefined,
  copy: (typeof signupActionCopy)[AppLocale],
) {
  const lowerMessage = message?.toLowerCase() ?? "";

  if (
    lowerMessage.includes("already") ||
    lowerMessage.includes("registered") ||
    lowerMessage.includes("exists")
  ) {
    return copy.emailAlreadyExists;
  }

  return copy.createAccountFailed;
}
