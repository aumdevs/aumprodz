import Link from "next/link";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AppLocale } from "@/lib/i18n/config";
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

const artistLoginCopy: Record<
  AppLocale,
  { badge: string; title: string; description: string; sideTitle: string; sideText: string }
> = {
  ht: {
    badge: "Atis",
    title: "Aksè atis",
    description: "Antre ak imèl ak modpas kont atis ou.",
    sideTitle: "Karyè ou rete òganize.",
    sideText:
      "Lansman, dosye, kontra, rapò ak sipò nan menm espas AUM PRODZ la.",
  },
  es: {
    badge: "Artista",
    title: "Acceso Artista",
    description: "Entra con el correo y la contraseña de tu cuenta artista.",
    sideTitle: "Tu carrera queda organizada.",
    sideText:
      "Lanzamientos, archivos, contratos, reportes y soporte en el mismo espacio AUM PRODZ.",
  },
  en: {
    badge: "Artist",
    title: "Artist Access",
    description: "Sign in with your artist account email and password.",
    sideTitle: "Your career stays organized.",
    sideText:
      "Releases, files, contracts, reports and support in the same AUM PRODZ workspace.",
  },
  fr: {
    badge: "Artiste",
    title: "Accès Artiste",
    description: "Connectez-vous avec l'email et le mot de passe de votre compte artiste.",
    sideTitle: "Votre carrière reste organisée.",
    sideText:
      "Sorties, fichiers, contrats, rapports et support dans le même espace AUM PRODZ.",
  },
  pt: {
    badge: "Artista",
    title: "Acesso Artista",
    description: "Entre com o email e a senha da sua conta de artista.",
    sideTitle: "Sua carreira fica organizada.",
    sideText:
      "Lançamentos, arquivos, contratos, relatórios e suporte no mesmo espaço AUM PRODZ.",
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getCurrentLocale();
  const nextPath = getSafeNextFromSearchParam(params.next);
  const context = getLoginContext(nextPath, locale);
  const messageKey = Array.isArray(params.reason)
    ? params.reason[0]
    : Array.isArray(params.error)
      ? params.error[0]
      : params.reason ?? params.error;
  const message =
    typeof messageKey === "string" ? messages[messageKey] : undefined;

  return (
    <main className="premium-grid relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(242,201,76,0.14),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden space-y-8 lg:block">
          <AumProdzLogo />
          <div className="max-w-2xl">
            <Badge tone={context.kind === "super" ? "accent" : "info"}>
              {context.badge}
            </Badge>
            <h1 className="mt-5 text-5xl font-black tracking-normal">
              {context.sideTitle}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {context.sideText}
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {["Supabase", "Stripe", "AUM PRODZ"].map((item) => (
              <div
                key={item}
                className="rounded-md border border-border bg-card/70 p-4"
              >
                <ShieldCheck className="size-5 text-success" />
                <p className="mt-3 text-sm font-bold">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="relative w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <AumProdzLogo />
            <ThemeToggle />
          </div>
          <div className="mb-4 flex justify-center gap-2">
            {context.kind === "artist" ? (
              <LanguageSwitcher currentLocale={locale} />
            ) : null}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
          <Card className="bg-card/95 shadow-2xl backdrop-blur">
          <CardHeader>
            <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                {context.badge}
              </span>
            </div>
            <CardTitle>{context.title}</CardTitle>
            <CardDescription>
              {context.description}
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
      </div>
    </main>
  );
}

function getLoginContext(nextPath: string, locale: AppLocale) {
  if (nextPath.startsWith("/super-admin")) {
    return {
      kind: "super" as const,
      badge: "Super Admin",
      title: "Acceso Super Admin",
      description: "Entrada protegida para control global de la plataforma.",
      sideTitle: "Control total de AUM PRODZ.",
      sideText:
        "Usuarios, roles, permisos, integraciones, auditoría y salud del sistema en una vista protegida.",
    };
  }

  if (nextPath.startsWith("/admin")) {
    return {
      kind: "admin" as const,
      badge: "Admin",
      title: "Acceso Admin",
      description: "Entrada protegida para operación, soporte y administración.",
      sideTitle: "Operación profesional en un solo panel.",
      sideText:
        "Servicios, leads, artistas, lanzamientos, pagos, contratos y reportes reales para administrar AUM PRODZ.",
    };
  }

  return {
    kind: "artist" as const,
    ...artistLoginCopy[locale],
  };
}
