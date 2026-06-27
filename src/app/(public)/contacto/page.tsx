import { MessageCircle } from "lucide-react";

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

type ContactCopy = {
  badge: string;
  formDescription: string;
  formTitle: string;
  formWhatsappButton: string;
  message: string;
  title: string;
  whatsappMessage: string;
  form: ContactMessageFormCopy;
};

const contactCopyByLocale: Record<AppLocale, ContactCopy> = {
  ht: {
    badge: "Pale ak AUM",
    formDescription:
      "Mesaj sa a ale dirèk nan panèl admin. Apre sa, m ap reponn nan imèl ou kite a.",
    formTitle: "Voye mesaj",
    formWhatsappButton: "Kontakte sou WhatsApp",
    message:
      "Ekri m ak plis kontèks posib: ki sèvis ou bezwen, ki pwoblèm ou genyen, lyen oswa detay pwojè a, ak ki rezilta ou vle jwenn. Mesaj la rive nan panèl admin AUM PRODZ, epi m ap reponn nan imèl ou kite a pou nou ka òganize pwochen etap la.",
    title: "Di m sa ou bezwen epi m ap ede w mete pwochen etap la an lòd.",
    whatsappMessage:
      "Bonjou AUM, mwen soti sou paj kontak la. Mwen vle pale sou yon sèvis.",
    form: {
      contextLabel: "Kontèks",
      contextPlaceholder: "YouTube, sit entènèt, miniati, mizik...",
      emailLabel: "Imèl",
      messageLabel: "Mesaj",
      messagePlaceholder:
        "Ekri mesaj ou isit la. Di m sa ou vle fè, pwoblèm ou genyen oswa sèvis ou bezwen.",
      nameLabel: "Non",
      namePlaceholder: "Non ou",
      submit: "Voye",
      submitting: "Ap voye...",
    },
  },
  es: {
    badge: "Ponte en contacto",
    formDescription:
      "Este mensaje llega directo al panel admin. Después respondo al correo que dejaste.",
    formTitle: "Enviar mensaje",
    formWhatsappButton: "Contactar vía WhatsApp",
    message:
      "Escríbeme con el mayor contexto posible: qué servicio necesitas, qué problema quieres resolver, enlaces o detalles del proyecto y qué resultado esperas. El mensaje llega directo al panel admin de AUM PRODZ y luego respondo al correo que dejaste para ordenar el próximo paso.",
    title: "Cuéntame qué necesitas y te ayudo a ordenar el próximo paso.",
    whatsappMessage:
      "Hola Aum, vengo desde la página de contacto. Quiero hablar sobre un servicio.",
    form: {
      contextLabel: "Contexto",
      contextPlaceholder: "YouTube, página web, miniatura, música...",
      emailLabel: "Correo electrónico",
      messageLabel: "Mensaje",
      messagePlaceholder:
        "Ingresa tu mensaje aquí. Cuéntame qué quieres hacer, qué problema tienes o qué servicio necesitas.",
      nameLabel: "Nombre",
      namePlaceholder: "Tu nombre",
      submit: "Enviar",
      submitting: "Enviando...",
    },
  },
  en: {
    badge: "Contact AUM",
    formDescription:
      "This message goes directly to the admin panel. Then I reply to the email you left.",
    formTitle: "Send message",
    formWhatsappButton: "Contact via WhatsApp",
    message:
      "Write with as much context as possible: the service you need, the problem you want to solve, project links or details, and the result you expect. The message goes directly to the AUM PRODZ admin panel, and I reply to the email you leave so we can organize the next step.",
    title: "Tell me what you need and I will help organize the next step.",
    whatsappMessage:
      "Hi AUM, I came from the contact page. I want to talk about a service.",
    form: {
      contextLabel: "Context",
      contextPlaceholder: "YouTube, website, thumbnail, music...",
      emailLabel: "Email",
      messageLabel: "Message",
      messagePlaceholder:
        "Enter your message here. Tell me what you want to do, what problem you have or what service you need.",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      submit: "Send",
      submitting: "Sending...",
    },
  },
  fr: {
    badge: "Contacter AUM",
    formDescription:
      "Ce message arrive directement au panel admin. Ensuite, je réponds à l'email que vous avez laissé.",
    formTitle: "Envoyer un message",
    formWhatsappButton: "Contacter via WhatsApp",
    message:
      "Écrivez avec le plus de contexte possible : le service dont vous avez besoin, le problème à résoudre, les liens ou détails du projet et le résultat attendu. Le message arrive directement dans le panel admin AUM PRODZ, puis je réponds à l'email laissé pour organiser la prochaine étape.",
    title: "Dites-moi ce dont vous avez besoin et je vous aide à organiser la prochaine étape.",
    whatsappMessage:
      "Bonjour AUM, je viens de la page contact. Je veux parler d'un service.",
    form: {
      contextLabel: "Contexte",
      contextPlaceholder: "YouTube, site web, miniature, musique...",
      emailLabel: "Email",
      messageLabel: "Message",
      messagePlaceholder:
        "Entrez votre message ici. Dites-moi ce que vous voulez faire, le problème ou le service nécessaire.",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      submit: "Envoyer",
      submitting: "Envoi...",
    },
  },
  pt: {
    badge: "Fale com AUM",
    formDescription:
      "Esta mensagem chega direto ao painel admin. Depois respondo no email que você deixou.",
    formTitle: "Enviar mensagem",
    formWhatsappButton: "Contactar pelo WhatsApp",
    message:
      "Escreva com o máximo de contexto possível: qual serviço você precisa, que problema quer resolver, links ou detalhes do projeto e o resultado esperado. A mensagem chega direto ao painel admin da AUM PRODZ e depois respondo no email que você deixou para organizar o próximo passo.",
    title: "Conte o que você precisa e eu ajudo a organizar o próximo passo.",
    whatsappMessage:
      "Olá AUM, vim da página de contato. Quero falar sobre um serviço.",
    form: {
      contextLabel: "Contexto",
      contextPlaceholder: "YouTube, site, miniatura, música...",
      emailLabel: "Email",
      messageLabel: "Mensagem",
      messagePlaceholder:
        "Digite sua mensagem aqui. Conte o que quer fazer, o problema ou o serviço que precisa.",
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
  return (
    <section className="flex min-h-[calc(100svh-5.5rem)] px-4 py-5 lg:h-[calc(100svh-5.5rem)] lg:min-h-0 lg:overflow-hidden lg:px-8 lg:py-4">
      <PublicEventTracker eventName="page_view" page="/contacto" source="contact" />

      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-8 lg:grid-cols-[0.86fr_1fr] lg:items-center xl:max-w-[72rem]">
        <div className="mx-auto max-w-xl space-y-5 lg:mx-0">
          <div className="space-y-3">
            <div className="mammouth-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-primary">
              <MessageCircle className="size-4" />
              {copy.badge}
            </div>
            <h1 className="mammouth-title text-3xl leading-[1.04] sm:text-4xl xl:text-[2.7rem]">
              {copy.title}
            </h1>
            <p className="mammouth-subtitle hidden text-base leading-7 sm:block xl:text-lg xl:leading-8">
              {copy.message}
            </p>
          </div>

        </div>

        <Card className="mammouth-card min-h-0 overflow-hidden">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>{copy.formTitle}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {copy.formDescription}
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <ContactMessageForm compact copy={copy.form} />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "whatsapp-cta-button mt-4 w-full",
              )}
              aria-disabled={!whatsappNumber}
            >
              <MessageCircle className="size-5" />
              {copy.formWhatsappButton}
            </a>
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
