import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtistRegisterForm } from "./register-form";

export const metadata = {
  title: "Crear Cuenta Artista",
  description:
    "Registro público de artista AUM PRODZ con pago anual por Stripe.",
};

export default function ArtistRegisterPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PublicEventTracker
        eventName="artist_pricing_view"
        page="/artista/registro"
        service="artista"
        source="artist_signup"
      />
      <Link
        href="/artista"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" />
        Volver a Artistas
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <Badge tone="accent">Cuenta artista</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-normal sm:text-5xl">
              Crea tu cuenta y activa tu acceso anual.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Completa tus datos, crea tu acceso privado y pasa al pago seguro
              de Stripe. Al terminar el pago entrarás al dashboard para subir
              lanzamientos.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Membresía anual artista: $99 USD.",
              "Single incluido mientras la cuenta esté activa.",
              "EP y álbum se pagan como cupos adicionales desde el dashboard.",
              "Cada lanzamiento queda en revisión antes de publicación.",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Si ya tienes cuenta,{" "}
            <Link href="/login?next=%2Fartist" className="font-semibold text-primary">
              entra al dashboard aquí
            </Link>
            .
          </p>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <ArtistRegisterForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
