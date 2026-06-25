"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  haitianDiasporaCountryOptions,
  musicGenreOptions,
  phoneCountryCodeOptions,
} from "@/lib/artist-options";
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

export function ArtistRegisterForm() {
  const [state, formAction, pending] = useActionState(
    createArtistAccountAction,
    initialState,
  );
  const values = state.values ?? initialState.values ?? {};

  return (
    <>
      <form action={formAction} className="grid gap-5">
        {state.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Nombre real"
            name="legal_name"
            defaultValue={values.legal_name}
            error={state.fieldErrors?.legal_name}
          />
          <Field
            label="Nombre de artista"
            name="artist_name"
            defaultValue={values.artist_name}
            error={state.fieldErrors?.artist_name}
          />
          <Field
            label="Correo"
            name="email"
            type="email"
            defaultValue={values.email}
            error={state.fieldErrors?.email}
            icon={<Mail className="size-4" />}
          />
          <Field
            label="Confirmar correo"
            name="email_confirmation"
            type="email"
            defaultValue={values.email_confirmation}
            error={state.fieldErrors?.email_confirmation}
            icon={<Mail className="size-4" />}
          />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            error={state.fieldErrors?.password}
          />
          <label className="grid gap-2 text-sm font-medium">
            País
            <select
              name="country"
              defaultValue={values.country ?? "Haití"}
              className="h-12 rounded-md border border-border bg-background px-3 text-sm"
            >
              {haitianDiasporaCountryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Teléfono
            <div className="grid gap-2 sm:grid-cols-[170px_1fr]">
              <select
                name="phone_country_code"
                defaultValue={values.phone_country_code ?? "+509"}
                className="h-12 rounded-md border border-border bg-background px-3 text-sm"
              >
                {phoneCountryCodeOptions.map((option) => (
                  <option
                    key={`${option.country}-${option.code}`}
                    value={option.code}
                  >
                    {option.code} {option.country}
                  </option>
                ))}
              </select>
              <Input
                name="phone_number"
                defaultValue={values.phone_number ?? ""}
                inputMode="tel"
                placeholder="Ejemplo: 3721 0000"
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
            Género musical
            <select
              name="genre"
              defaultValue={values.genre ?? "Rap"}
              className="h-12 rounded-md border border-border bg-background px-3 text-sm"
            >
              {musicGenreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Perfil / biografía
          <textarea
            name="bio"
            defaultValue={values.bio ?? ""}
            placeholder="Cuéntanos brevemente quién eres, tu ciudad y tu enfoque musical."
            className="min-h-28 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="rounded-md border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Tu correo queda como acceso principal de la cuenta. Al continuar,
              el pago seguro se abrirá aquí mismo dentro de la plataforma.
            </p>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <CreditCard className="size-5" />
          )}
          {pending ? "Preparando pago..." : "Crear cuenta y pagar $99"}
        </Button>
      </form>
      {state.checkoutClientSecret ? (
        <EmbeddedAnnualCheckout clientSecret={state.checkoutClientSecret} />
      ) : null}
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  autoComplete,
  icon,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
  icon?: ReactNode;
}) {
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

type StripeEmbeddedCheckout = {
  mount: (selector: string) => void;
  destroy: () => void;
};

type StripeClient = {
  initEmbeddedCheckout: (input: {
    clientSecret: string;
  }) => Promise<StripeEmbeddedCheckout>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeClient | null;
  }
}

let stripeScriptPromise: Promise<void> | null = null;

function EmbeddedAnnualCheckout({ clientSecret }: { clientSecret: string }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let checkout: StripeEmbeddedCheckout | null = null;
    let disposed = false;

    async function mountCheckout() {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!publishableKey) {
        setError(
          "Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local para mostrar el pago dentro de la plataforma.",
        );
        return;
      }

      await loadStripeScript();
      const stripe = window.Stripe?.(publishableKey);

      if (!stripe) {
        setError("Stripe no pudo iniciar. Recarga la página e intenta de nuevo.");
        return;
      }

      const embeddedCheckout = await stripe.initEmbeddedCheckout({
        clientSecret,
      });

      if (disposed) {
        embeddedCheckout.destroy();
        return;
      }

      checkout = embeddedCheckout;
      embeddedCheckout.mount("#artist-annual-checkout");
    }

    void mountCheckout().catch(() => {
      setError("No se pudo abrir el pago seguro. Revisa Stripe e intenta de nuevo.");
    });

    return () => {
      disposed = true;
      checkout?.destroy();
    };
  }, [clientSecret]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/82 px-4 py-6 backdrop-blur">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Pago seguro
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-normal">
              Activar cuenta artista
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa el pago anual y al finalizar entrarás al dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.assign("/artist")}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar pago"
          >
            <X className="size-5" />
          </button>
        </div>
        {error ? (
          <div className="m-5 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="min-h-[520px] overflow-y-auto p-5">
          {!error ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Cargando formulario seguro de pago...
            </div>
          ) : null}
          <div id="artist-annual-checkout" />
        </div>
      </div>
    </div>
  );
}

function loadStripeScript() {
  if (window.Stripe) {
    return Promise.resolve();
  }

  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Stripe.js failed to load"));
      document.head.appendChild(script);
    });
  }

  return stripeScriptPromise;
}
