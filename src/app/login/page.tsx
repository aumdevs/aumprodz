import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { getSafeNextFromSearchParam } from "@/lib/permissions";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Acceso Artista",
};

const messages: Record<string, string> = {
  configuration:
    "Supabase aun no esta configurado. Agrega las variables de entorno antes de iniciar sesion.",
  auth: "Inicia sesion para continuar.",
  forbidden: "Tu cuenta no tiene permisos para esa seccion.",
  missing_credentials: "Completa email y contraseña.",
  invalid_credentials: "Credenciales inválidas o usuario no encontrado.",
  callback: "No se pudo completar el callback de autenticacion.",
  password_updated: "Tu contraseña fue actualizada. Entra con la nueva clave.",
  artist_signup_paid:
    "Pago recibido. Si Stripe ya confirmó el pago, te enviaremos un enlace al correo para crear tu contraseña y entrar al dashboard.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getCurrentLocale();
  const nextPath = getSafeNextFromSearchParam(params.next);
  const messageKey = Array.isArray(params.reason)
    ? params.reason[0]
    : Array.isArray(params.error)
      ? params.error[0]
      : params.reason ?? params.error;
  const message =
    typeof messageKey === "string" ? messages[messageKey] : undefined;

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(250,247,239,0.94), rgba(250,247,239,0.84)), url('/aum-prodz-platform-hero.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-28 border-b border-border/70 bg-background/50 backdrop-blur" />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <AumProdzLogo />
        </div>
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher currentLocale={locale} />
        </div>
        <Card className="bg-card/95 shadow-xl backdrop-blur">
          <CardHeader>
            <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>{t(locale, "login.title")}</CardTitle>
            <CardDescription>
              {t(locale, "login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message ? (
              <div className="mb-5 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
                {message}
              </div>
            ) : null}
            <LoginForm locale={locale} nextPath={nextPath} />
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {t(locale, "login.back")}
          </Link>
        </div>
      </div>
    </main>
  );
}
