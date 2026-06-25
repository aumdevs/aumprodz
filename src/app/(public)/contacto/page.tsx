import { Mail, MessageCircle } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWhatsAppNumber } from "@/lib/env";
import { cn } from "@/lib/utils";
import { ContactMessageForm } from "./contact-message-form";

export const metadata = {
  title: "Contacto",
};

const contactEmail = "admin@aumprodz.com";

export default function ContactPage() {
  const whatsappNumber = normalizeWhatsAppNumber(getWhatsAppNumber());
  const whatsappHref = whatsappNumber
    ? buildWhatsappHref(
        whatsappNumber,
        "Hola Aum, vengo desde la página de contacto. Quiero hablar sobre un servicio.",
      )
    : "#";
  const emailHref = buildEmailHref({
    subject: "Contacto desde AUM PRODZ",
    body: "Hola Aum,\n\nQuiero hablar sobre un servicio.",
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <PublicEventTracker eventName="page_view" page="/contacto" source="contact" />

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-7">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
              <MessageCircle className="size-4" />
              Ponte en contacto
            </div>
            <h1 className="text-4xl font-black tracking-normal sm:text-5xl">
              Cuéntame qué necesitas y te ayudo a ordenar el próximo paso.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Escríbeme con contexto: canal de YouTube, página web, miniatura,
              video, música o cualquier servicio que quieras trabajar con AUM
              PRODZ. Mientras más claro sea el mensaje, más rápido podemos
              avanzar.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
              aria-disabled={!whatsappNumber}
            >
              <MessageCircle className="size-5" />
              Vía WhatsApp
            </a>
            <a
              href={emailHref}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-full",
              )}
            >
              <Mail className="size-5" />
              Vía email
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mensaje rápido</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Cuéntame qué quieres decir y te ayudo. Este mensaje llega directo
              al panel admin.
            </p>
          </CardHeader>
          <CardContent>
            <ContactMessageForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function normalizeWhatsAppNumber(value: string | undefined) {
  const normalized = value?.replace(/\D/g, "");

  return normalized && normalized.length >= 8 ? normalized : null;
}

function buildWhatsappHref(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function buildEmailHref({
  subject,
  body,
}: {
  subject: string;
  body: string;
}) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
