import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  Headphones,
  Megaphone,
  Music2,
} from "lucide-react";

import {
  PublicEventTracker,
  TrackedLink,
} from "@/components/public/public-event-tracker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const checklist = [
  "Perfil artístico privado con tus datos y contacto principal.",
  "Lanzamientos de canciones, videos, EP y álbumes organizados por estado.",
  "Carga de archivos, links externos y revisión interna por AUM PRODZ.",
  "Contratos, soporte y seguimiento de la operación desde tu dashboard.",
];

export const metadata = {
  title: "ARTISTA",
  description:
    "Cuenta anual para artistas de AUM PRODZ con verificación, contrato, dashboard privado y operación de lanzamientos.",
};

export default async function ArtistLandingPage() {
  const locale = await getCurrentLocale();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PublicEventTracker
        eventName="artist_pricing_view"
        page="/artista"
        service="artista"
        source="artist_page"
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Badge tone="accent">{t(locale, "artistLanding.badge")}</Badge>
          <div className="space-y-5">
            <h1 className="text-4xl font-black tracking-normal sm:text-6xl">
              {t(locale, "artistLanding.title")}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {t(locale, "artistLanding.description")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href="/artista/registro"
              eventName="artist_checkout_click"
              page="/artista"
              service="artista"
              source="artist_page"
              placement="primary_create_account"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              {t(locale, "artistLanding.create")}
              <ArrowRight className="size-5" />
            </TrackedLink>
            <TrackedLink
              href="/login?next=%2Fartist"
              eventName="artist_checkout_click"
              page="/artista"
              service="artista"
              source="artist_page"
              placement="existing_artist_login"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              {t(locale, "artistLanding.login")}
              <ArrowRight className="size-5" />
            </TrackedLink>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Music2 className="size-6 text-primary" />
                <CardTitle>Lanzamientos organizados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Envía canciones, videos, portadas y datos del lanzamiento sin
                  perder el orden. Cada pieza queda conectada a tu cuenta.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Megaphone className="size-6 text-primary" />
                <CardTitle>Promoción artística</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Cuando tengas una nueva canción, puedes preparar apoyo de
                  promoción para mover el lanzamiento con mejor dirección.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Acceso del artista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.map((item) => (
              <p key={item} className="flex gap-3 text-sm leading-6">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </p>
            ))}
            <div className="grid gap-3 pt-2">
              {[
                { icon: Headphones, label: "Música y videos en revisión" },
                { icon: FileSignature, label: "Firma y autorización legal" },
                { icon: Megaphone, label: "Promoción conectada al lanzamiento" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-md border border-border bg-background p-3 text-sm font-semibold"
                >
                  <Icon className="size-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
            <div className="rounded-md border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
              La plataforma no es solo un formulario: es el centro donde tu
              carrera artística se organiza con datos reales y seguimiento.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
