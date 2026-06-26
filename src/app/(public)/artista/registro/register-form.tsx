"use client";

import { useActionState, type ClipboardEvent, type DragEvent, type ReactNode } from "react";
import {
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  haitianDiasporaCountryOptions,
  musicGenreOptions,
  phoneCountryCodeOptions,
} from "@/lib/artist-options";
import type { AppLocale } from "@/lib/i18n/config";
import {
  createArtistAccountAction,
  type ArtistSignupState,
} from "./actions";

const initialState: ArtistSignupState = {
  values: {
    phone_country_code: "+509",
    country: "Haití",
    genre: "Rap",
  },
};

const formCopyByLocale: Record<
  AppLocale,
  {
    legalName: string;
    artistName: string;
    email: string;
    emailConfirmation: string;
    country: string;
    phone: string;
    phonePlaceholder: string;
    genre: string;
    bio: string;
    bioPlaceholder: string;
    note: string;
    submit: string;
    pending: string;
  }
> = {
  ht: {
    legalName: "Non legal",
    artistName: "Non atis",
    email: "Imèl",
    emailConfirmation: "Konfime imèl",
    country: "Peyi",
    phone: "Telefòn",
    phonePlaceholder: "Egzanp: 3721 0000",
    genre: "Stil mizik",
    bio: "Pwofil / biyografi",
    bioPlaceholder:
      "Di nou rapidman kiyès ou ye, vil ou ak direksyon mizik ou.",
    note:
      "Nou pa kreye kont ou avan peman an konfime. Apre Stripe konfime peman an, n ap voye yon lyen sou imèl ou pou w kreye modpas ou epi antre nan dashboard la.",
    submit: "Kontinye pou peye $99",
    pending: "Ap prepare peman...",
  },
  es: {
    legalName: "Nombre real",
    artistName: "Nombre de artista",
    email: "Correo",
    emailConfirmation: "Confirmar correo",
    country: "País",
    phone: "Teléfono",
    phonePlaceholder: "Ejemplo: 3721 0000",
    genre: "Género musical",
    bio: "Perfil / biografía",
    bioPlaceholder:
      "Cuéntanos brevemente quién eres, tu ciudad y tu enfoque musical.",
    note:
      "No creamos tu cuenta antes de confirmar el pago. Después de que Stripe confirme el pago, te enviaremos un enlace a tu correo para crear contraseña y entrar al dashboard.",
    submit: "Continuar para pagar $99",
    pending: "Preparando pago...",
  },
  en: {
    legalName: "Legal name",
    artistName: "Artist name",
    email: "Email",
    emailConfirmation: "Confirm email",
    country: "Country",
    phone: "Phone",
    phonePlaceholder: "Example: 3721 0000",
    genre: "Music genre",
    bio: "Profile / bio",
    bioPlaceholder:
      "Briefly tell us who you are, your city and your musical direction.",
    note:
      "We do not create your account before payment is confirmed. After Stripe confirms payment, we will email you a link to create your password and enter the dashboard.",
    submit: "Continue to pay $99",
    pending: "Preparing payment...",
  },
  fr: {
    legalName: "Nom légal",
    artistName: "Nom d'artiste",
    email: "Email",
    emailConfirmation: "Confirmer l'email",
    country: "Pays",
    phone: "Téléphone",
    phonePlaceholder: "Exemple: 3721 0000",
    genre: "Genre musical",
    bio: "Profil / biographie",
    bioPlaceholder:
      "Dites-nous brièvement qui vous êtes, votre ville et votre direction musicale.",
    note:
      "Nous ne créons pas votre compte avant la confirmation du paiement. Après confirmation par Stripe, nous vous enverrons un lien pour créer votre mot de passe et entrer dans le dashboard.",
    submit: "Continuer pour payer $99",
    pending: "Préparation du paiement...",
  },
  pt: {
    legalName: "Nome legal",
    artistName: "Nome artístico",
    email: "Email",
    emailConfirmation: "Confirmar email",
    country: "País",
    phone: "Telefone",
    phonePlaceholder: "Exemplo: 3721 0000",
    genre: "Gênero musical",
    bio: "Perfil / biografia",
    bioPlaceholder:
      "Conte rapidamente quem você é, sua cidade e sua direção musical.",
    note:
      "Não criamos sua conta antes da confirmação do pagamento. Depois que a Stripe confirmar o pagamento, enviaremos um link para criar sua senha e entrar no dashboard.",
    submit: "Continuar para pagar $99",
    pending: "Preparando pagamento...",
  },
};

const countryLabels: Record<AppLocale, Record<string, string>> = {
  ht: {
    Haití: "Ayiti",
    "Estados Unidos": "Etazini",
    "República Dominicana": "Repiblik Dominikèn",
    Canadá: "Kanada",
    Chile: "Chili",
    Brasil: "Brezil",
    Francia: "Lafrans",
    Bahamas: "Bahamas",
    México: "Meksik",
    "Turks and Caicos": "Turks and Caicos",
    "Guayana Francesa": "Giyàn franse",
    Otro: "Lòt",
  },
  es: {},
  en: {
    Haití: "Haiti",
    "Estados Unidos": "United States",
    "República Dominicana": "Dominican Republic",
    Canadá: "Canada",
    Chile: "Chile",
    Brasil: "Brazil",
    Francia: "France",
    México: "Mexico",
    "Guayana Francesa": "French Guiana",
    Otro: "Other",
  },
  fr: {
    Haití: "Haïti",
    "Estados Unidos": "États-Unis",
    "República Dominicana": "République dominicaine",
    Canadá: "Canada",
    Chile: "Chili",
    Brasil: "Brésil",
    Francia: "France",
    México: "Mexique",
    "Guayana Francesa": "Guyane française",
    Otro: "Autre",
  },
  pt: {
    Haití: "Haiti",
    "Estados Unidos": "Estados Unidos",
    "República Dominicana": "República Dominicana",
    Canadá: "Canadá",
    Chile: "Chile",
    Brasil: "Brasil",
    Francia: "França",
    México: "México",
    "Guayana Francesa": "Guiana Francesa",
    Otro: "Outro",
  },
};

const genreLabels: Record<AppLocale, Record<string, string>> = {
  ht: { Otro: "Lòt" },
  es: {},
  en: { Otro: "Other" },
  fr: { Otro: "Autre" },
  pt: { Otro: "Outro" },
};

export function ArtistRegisterForm({ locale }: { locale: AppLocale }) {
  const copy = formCopyByLocale[locale] ?? formCopyByLocale.ht;
  const [state, formAction, pending] = useActionState(
    createArtistAccountAction,
    initialState,
  );
  const values = state.values ?? initialState.values ?? {};

  return (
    <>
      <form action={formAction} className="grid gap-5">
        <input type="hidden" name="locale" value={locale} />
        {state.error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={copy.legalName}
            name="legal_name"
            defaultValue={values.legal_name}
            error={state.fieldErrors?.legal_name}
          />
          <Field
            label={copy.artistName}
            name="artist_name"
            defaultValue={values.artist_name}
            error={state.fieldErrors?.artist_name}
          />
          <Field
            label={copy.email}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values.email}
            error={state.fieldErrors?.email}
            icon={<Mail className="size-4" />}
          />
          <Field
            label={copy.emailConfirmation}
            name="email_confirmation"
            type="email"
            autoComplete="off"
            preventPaste
            defaultValue={values.email_confirmation}
            error={state.fieldErrors?.email_confirmation}
            icon={<Mail className="size-4" />}
          />
          <label className="grid gap-2 text-sm font-medium">
            {copy.country}
            <select
              name="country"
              defaultValue={values.country ?? "Haití"}
              className="h-12 rounded-2xl border border-border bg-background px-3 text-sm"
            >
              {haitianDiasporaCountryOptions.map((country) => (
                <option key={country} value={country}>
                  {getCountryLabel(locale, country)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {copy.phone}
            <div className="grid gap-2 sm:grid-cols-[170px_1fr]">
              <select
                name="phone_country_code"
                defaultValue={values.phone_country_code ?? "+509"}
                className="h-12 rounded-2xl border border-border bg-background px-3 text-sm"
              >
                {phoneCountryCodeOptions.map((option) => (
                  <option
                    key={`${option.country}-${option.code}`}
                    value={option.code}
                  >
                    {option.code} {getCountryLabel(locale, option.country)}
                  </option>
                ))}
              </select>
              <Input
                name="phone_number"
                defaultValue={values.phone_number ?? ""}
                inputMode="tel"
                placeholder={copy.phonePlaceholder}
                className={cn(
                  "h-12 text-base",
                  state.fieldErrors?.phone_number ? "border-destructive" : "",
                )}
              />
            </div>
            {state.fieldErrors?.phone_number ? (
              <span className="text-xs font-normal text-destructive">
                {state.fieldErrors.phone_number}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {copy.genre}
            <select
              name="genre"
              defaultValue={values.genre ?? "Rap"}
              className="h-12 rounded-2xl border border-border bg-background px-3 text-sm"
            >
              {musicGenreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {getGenreLabel(locale, genre)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          {copy.bio}
          <textarea
            name="bio"
            defaultValue={values.bio ?? ""}
            placeholder={copy.bioPlaceholder}
            className="min-h-28 rounded-2xl border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="rounded-2xl border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>{copy.note}</p>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <CreditCard className="size-5" />
          )}
          {pending ? copy.pending : copy.submit}
        </Button>
      </form>
    </>
  );
}

function getCountryLabel(locale: AppLocale, country: string) {
  return countryLabels[locale]?.[country] ?? country;
}

function getGenreLabel(locale: AppLocale, genre: string) {
  return genreLabels[locale]?.[genre] ?? genre;
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  autoComplete,
  icon,
  preventPaste = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
  icon?: ReactNode;
  preventPaste?: boolean;
}) {
  const blockPaste = (
    event: ClipboardEvent<HTMLInputElement> | DragEvent<HTMLInputElement>,
  ) => {
    if (preventPaste) {
      event.preventDefault();
    }
  };

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <Input
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          autoComplete={autoComplete}
          onDrop={blockPaste}
          onPaste={blockPaste}
          className={cn(
            "h-12 text-base",
            icon ? "pl-10" : "",
            error ? "border-destructive" : "",
          )}
        />
      </div>
      {error ? (
        <span className="text-xs font-normal text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
