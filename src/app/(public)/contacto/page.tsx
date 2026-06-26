import { Mail, MessageCircle } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWhatsAppNumber } from "@/lib/env";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import {
  ContactMessageForm,
  type ContactMessageFormCopy,
} from "./contact-message-form";

export const metadata = {
  title: "Contacto",
};

const contactEmail = "admin@aumprodz.com";

type ContactCopy = {
  badge: string;
  emailButton: string;
  formDescription: string;
  formTitle: string;
  message: string;
  title: string;
  whatsappButton: string;
  whatsappMessage: string;
  form: ContactMessageFormCopy;
};

const contactCopyByLocale: Record<AppLocale, ContactCopy> = {
  ht: {
    badge: "Pale ak AUM",
    emailButton: "Pa email",
    formDescription:
      "Di m sa ou bezwen. Mesaj la ale dirèk nan panèl admin pou swivi.",
    formTitle: "Mesaj rapid",
    message:
      "Ekri ak kontèks: chanèl YouTube, sit entènèt, miniati, videyo, mizik oswa nenpòt sèvis ou vle travay ak AUM PRODZ. Plis mesaj la klè, se plis nou ka avanse vit.",
    title: "Di m sa ou bezwen epi m ap ede w mete pwochen etap la an lòd.",
    whatsappButton: "Pa WhatsApp",
    whatsappMessage:
      "Bonjou AUM, mwen soti sou paj kontak la. Mwen vle pale sou yon sèvis.",
    form: {
      contextLabel: "Kontèks",
      contextPlaceholder: "YouTube, sit entènèt, miniati, mizik...",
      emailLabel: "Imèl",
      messageLabel: "Mesaj",
      messagePlaceholder:
        "Ekri mesaj ou isit la. Di m sa ou vle fè, pwoblèm ou genyen oswa sèvis ou bezwen.",
      mobileSubmit: "Kontakte sou WhatsApp",
      nameLabel: "Non",
      namePlaceholder: "Non ou",
      submit: "Voye",
      submitting: "Ap voye...",
    },
  },
  es: {
    badge: "Ponte en contacto",
    emailButton: "Vía email",
    formDescription:
      "Cuéntame qué quieres decir y te ayudo. Este mensaje llega directo al panel admin.",
    formTitle: "Mensaje rápido",
    message:
      "Escríbeme con contexto: canal de YouTube, página web, miniatura, video, música o cualquier servicio que quieras trabajar con AUM PRODZ. Mientras más claro sea el mensaje, más rápido podemos avanzar.",
    title: "Cuéntame qué necesitas y te ayudo a ordenar el próximo paso.",
    whatsappButton: "Vía WhatsApp",
    whatsappMessage:
      "Hola Aum, vengo desde la página de contacto. Quiero hablar sobre un servicio.",
    form: {
      contextLabel: "Contexto",
      contextPlaceholder: "YouTube, página web, miniatura, música...",
      emailLabel: "Correo electrónico",
      messageLabel: "Mensaje",
      messagePlaceholder:
        "Ingresa tu mensaje aquí. Cuéntame qué quieres hacer, qué problema tienes o qué servicio necesitas.",
      mobileSubmit: "Contactar vía WhatsApp",
      nameLabel: "Nombre",
      namePlaceholder: "Tu nombre",
      submit: "Enviar",
      submitting: "Enviando...",
    },
  },
  en: {
    badge: "Contact AUM",
    emailButton: "By email",
    formDescription:
      "Tell me what you need. This message goes directly to the admin panel for follow-up.",
    formTitle: "Quick message",
    message:
      "Write with context: YouTube channel, website, thumbnail, video, music or any service you want to work on with AUM PRODZ. The clearer the message, the faster we can move.",
    title: "Tell me what you need and I will help organize the next step.",
    whatsappButton: "By WhatsApp",
    whatsappMessage:
      "Hi AUM, I came from the contact page. I want to talk about a service.",
    form: {
      contextLabel: "Context",
      contextPlaceholder: "YouTube, website, thumbnail, music...",
      emailLabel: "Email",
      messageLabel: "Message",
      messagePlaceholder:
        "Enter your message here. Tell me what you want to do, what problem you have or what service you need.",
      mobileSubmit: "Contact via WhatsApp",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      submit: "Send",
      submitting: "Sending...",
    },
  },
  fr: {
    badge: "Contacter AUM",
    emailButton: "Par email",
    formDescription:
      "Dites-moi ce dont vous avez besoin. Le message arrive directement au panel admin pour suivi.",
    formTitle: "Message rapide",
    message:
      "Écrivez avec contexte: chaîne YouTube, site web, miniature, vidéo, musique ou tout service à travailler avec AUM PRODZ. Plus le message est clair, plus nous avançons vite.",
    title: "Dites-moi ce dont vous avez besoin et je vous aide à organiser la prochaine étape.",
    whatsappButton: "Par WhatsApp",
    whatsappMessage:
      "Bonjour AUM, je viens de la page contact. Je veux parler d'un service.",
    form: {
      contextLabel: "Contexte",
      contextPlaceholder: "YouTube, site web, miniature, musique...",
      emailLabel: "Email",
      messageLabel: "Message",
      messagePlaceholder:
        "Entrez votre message ici. Dites-moi ce que vous voulez faire, le problème ou le service nécessaire.",
      mobileSubmit: "Contacter via WhatsApp",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      submit: "Envoyer",
      submitting: "Envoi...",
    },
  },
  pt: {
    badge: "Fale com AUM",
    emailButton: "Por email",
    formDescription:
      "Conte o que você precisa. Esta mensagem chega direto ao painel admin para acompanhamento.",
    formTitle: "Mensagem rápida",
    message:
      "Escreva com contexto: canal de YouTube, site, miniatura, vídeo, música ou qualquer serviço que queira trabalhar com AUM PRODZ. Quanto mais clara a mensagem, mais rápido avançamos.",
    title: "Conte o que você precisa e eu ajudo a organizar o próximo passo.",
    whatsappButton: "Por WhatsApp",
    whatsappMessage:
      "Olá AUM, vim da página de contato. Quero falar sobre um serviço.",
    form: {
      contextLabel: "Contexto",
      contextPlaceholder: "YouTube, site, miniatura, música...",
      emailLabel: "Email",
      messageLabel: "Mensagem",
      messagePlaceholder:
        "Digite sua mensagem aqui. Conte o que quer fazer, o problema ou o serviço que precisa.",
      mobileSubmit: "Contactar pelo WhatsApp",
      nameLabel: "Nome",
      namePlaceholder: "Seu nome",
      submit: "Enviar",
      submitting: "Enviando...",
    },
  },
};

export default async function ContactPage() {
  const locale = await getCurrentLocale();
  const copy = contactCopyByLocale[locale] ?? contactCopyByLocale.ht;
  const whatsappNumber = normalizeWhatsAppNumber(getWhatsAppNumber());
  const whatsappHref = whatsappNumber
    ? buildWhatsappHref(
        whatsappNumber,
        copy.whatsappMessage,
      )
    : "#";
  const emailHref = buildEmailHref({
    subject: "Contacto desde AUM PRODZ",
    body: `${copy.whatsappMessage}\n`,
  });

  return (
    <section className="public-section-tight">
      <PublicEventTracker eventName="page_view" page="/contacto" source="contact" />

      <div className="public-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-7">
          <div className="space-y-4">
            <div className="mammouth-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-primary">
              <MessageCircle className="size-4" />
              {copy.badge}
            </div>
            <h1 className="mammouth-title text-4xl sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mammouth-subtitle hidden max-w-2xl text-xl sm:block">
              {copy.message}
            </p>
          </div>

          <div className="hidden gap-3 sm:grid sm:grid-cols-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
              aria-disabled={!whatsappNumber}
            >
              <MessageCircle className="size-5" />
              {copy.whatsappButton}
            </a>
            <a
              href={emailHref}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-full",
              )}
            >
              <Mail className="size-5" />
              {copy.emailButton}
            </a>
          </div>
        </div>

        <Card className="mammouth-card">
          <CardHeader>
            <CardTitle>{copy.formTitle}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {copy.formDescription}
            </p>
          </CardHeader>
          <CardContent>
            <ContactMessageForm copy={copy.form} />
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
