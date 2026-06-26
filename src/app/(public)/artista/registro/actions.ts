"use server";

import { redirect } from "next/navigation";

import { ARTIST_ANNUAL_PRODUCT_KEY } from "@/lib/artist-billing";
import { getAppBaseUrl, getEnv } from "@/lib/env";
import { normalizeLocale, type AppLocale } from "@/lib/i18n/config";
import { getStripeClient, stripePriceEnv } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

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
  fieldErrors?: Partial<Record<keyof ArtistSignupValues, string>>;
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
  const fieldErrors = validateSignup(values, copy);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: copy.completeMarkedFields,
      fieldErrors,
      values,
    };
  }

  const serviceSupabase = createServiceSupabaseClient();

  if (!serviceSupabase) {
    return {
      error: copy.supabaseNotConfigured,
      values,
    };
  }

  const phone = buildPhone(values);
  const { data: existingProfile, error: existingProfileError } =
    await serviceSupabase
      .from("profiles")
      .select("id")
      .eq("email", values.email)
      .maybeSingle();

  if (existingProfileError) {
    return {
      error: copy.emailCheckFailed,
      values,
    };
  }

  if (existingProfile?.id) {
    return {
      error: copy.emailAlreadyExists,
      values,
    };
  }

  const checkout = await createHostedArtistAnnualCheckout({
    values,
    phone,
  });

  if (!checkout.ok) {
    return {
      error:
        checkout.reason === "stripe_not_configured"
          ? copy.stripeNotConfigured
          : copy.checkoutPrepareFailed,
      values,
    };
  }

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
    phoneRequired: string;
    emailCheckFailed: string;
    emailAlreadyExists: string;
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
    phoneRequired: "Ekri nimewo telefòn ou.",
    emailCheckFailed: "Nou pa t kapab verifye imèl la. Eseye ankò.",
    emailAlreadyExists: "Imèl sa a deja gen kont. Antre nan dashboard la ak imèl sa a.",
    stripeNotConfigured:
      "Stripe poko konfigire pou ouvri peman an. Pa gen kont ki te kreye.",
    checkoutPrepareFailed:
      "Nou pa t kapab prepare peman anyèl la. Pa gen kont ki te kreye; eseye ankò.",
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
    phoneRequired: "Escribe tu número de teléfono.",
    emailCheckFailed: "No pudimos verificar si el correo ya existe. Intenta otra vez.",
    emailAlreadyExists: "Ese correo ya tiene cuenta. Entra al dashboard con ese correo.",
    stripeNotConfigured:
      "Stripe no está configurado para abrir el pago aquí. No se creó ninguna cuenta.",
    checkoutPrepareFailed:
      "No se pudo preparar el pago anual. No se creó ninguna cuenta; intenta otra vez.",
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
    phoneRequired: "Enter your phone number.",
    emailCheckFailed: "We could not verify whether that email already exists. Try again.",
    emailAlreadyExists: "That email already has an account. Sign in to the dashboard with it.",
    stripeNotConfigured:
      "Stripe is not configured to open payment. No account was created.",
    checkoutPrepareFailed:
      "Annual payment could not be prepared. No account was created; try again.",
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
    phoneRequired: "Entrez votre numéro de téléphone.",
    emailCheckFailed: "Nous n'avons pas pu vérifier si cet email existe déjà. Réessayez.",
    emailAlreadyExists: "Cet email a déjà un compte. Connectez-vous au dashboard avec cet email.",
    stripeNotConfigured:
      "Stripe n'est pas configuré pour ouvrir le paiement. Aucun compte n'a été créé.",
    checkoutPrepareFailed:
      "Le paiement annuel n'a pas pu être préparé. Aucun compte n'a été créé; réessayez.",
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
    phoneRequired: "Escreva seu número de telefone.",
    emailCheckFailed: "Não foi possível verificar se esse email já existe. Tente de novo.",
    emailAlreadyExists: "Esse email já tem conta. Entre no dashboard com esse email.",
    stripeNotConfigured:
      "A Stripe não está configurada para abrir o pagamento. Nenhuma conta foi criada.",
    checkoutPrepareFailed:
      "Não foi possível preparar o pagamento anual. Nenhuma conta foi criada; tente de novo.",
  },
};

function validateSignup(
  values: ArtistSignupValues,
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

  if (!values.phone_number) {
    errors.phone_number = copy.phoneRequired;
  }

  return errors;
}

async function createHostedArtistAnnualCheckout({
  values,
  phone,
}: {
  values: ArtistSignupValues;
  phone: string | null;
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
  const metadata = buildSignupMetadata(values, phone);

  if (!values.email) {
    return { ok: false, reason: "stripe_error", message: "Missing signup email" };
  }

  const cancelUrl = new URL("/artista/registro", appBaseUrl);
  cancelUrl.searchParams.set("checkout", "cancelled");
  const successUrl = `${appBaseUrl}/login?reason=artist_signup_paid&email=${encodeURIComponent(
    values.email,
  )}&session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe.checkout.sessions
    .create({
      mode: "subscription",
      client_reference_id: values.email,
      customer_email: values.email,
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
      success_url: successUrl,
      cancel_url: cancelUrl.toString(),
      allow_promotion_codes: true,
    })
    .catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unknown Stripe checkout error";
      console.error("Artist signup Stripe checkout failed", {
        email: values.email,
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

function buildSignupMetadata(values: ArtistSignupValues, phone: string | null) {
  const metadata: Record<string, string> = {
    product: ARTIST_ANNUAL_PRODUCT_KEY,
    signup_flow: "artist_public_signup",
  };

  addMetadataValue(metadata, "signup_email", values.email);
  addMetadataValue(metadata, "legal_name", values.legal_name);
  addMetadataValue(metadata, "artist_name", values.artist_name);
  addMetadataValue(metadata, "phone", phone);
  addMetadataValue(metadata, "country", values.country);
  addMetadataValue(metadata, "genre", values.genre);
  addMetadataValue(metadata, "bio", values.bio);

  return metadata;
}

function addMetadataValue(
  metadata: Record<string, string>,
  key: string,
  value?: string | null,
) {
  const cleanValue = value?.trim();

  if (cleanValue) {
    metadata[key] = cleanValue.slice(0, 480);
  }
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
