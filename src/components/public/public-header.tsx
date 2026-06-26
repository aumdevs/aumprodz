import { PublicHeaderClient } from "@/components/public/public-header-client";
import { getWhatsAppNumber } from "@/lib/env";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import type { AppLocale } from "@/lib/i18n/config";

const navItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/servicios", labelKey: "nav.services" },
  { href: "/youtube", labelKey: "nav.youtube" },
  { href: "/artista", labelKey: "nav.artists" },
  { href: "/contacto", labelKey: "nav.contact" },
] as const;

const headerCopyByLocale: Record<
  AppLocale,
  {
    artistCta: string;
    close: string;
    menu: string;
    platformLabel: string;
    projectCta: string;
    whatsappCta: string;
    whatsappMessage: string;
  }
> = {
  ht: {
    artistCta: "AUM Artist",
    close: "Fèmen meni",
    menu: "Louvri meni",
    platformLabel: "Platfòm",
    projectCta: "Kòmanse",
    whatsappCta: "Pale ak AUM sou WhatsApp",
    whatsappMessage: "Bonjou AUM, mwen vle pale ak ou sou WhatsApp.",
  },
  es: {
    artistCta: "AUM Artist",
    close: "Cerrar menú",
    menu: "Abrir menú",
    platformLabel: "Plataforma",
    projectCta: "Comenzar",
    whatsappCta: "Hablar con AUM por WhatsApp",
    whatsappMessage: "Hola AUM, quiero hablar contigo por WhatsApp.",
  },
  en: {
    artistCta: "AUM Artist",
    close: "Close menu",
    menu: "Open menu",
    platformLabel: "Platform",
    projectCta: "Start",
    whatsappCta: "Talk to AUM on WhatsApp",
    whatsappMessage: "Hi AUM, I want to talk to you on WhatsApp.",
  },
  fr: {
    artistCta: "AUM Artist",
    close: "Fermer le menu",
    menu: "Ouvrir le menu",
    platformLabel: "Plateforme",
    projectCta: "Commencer",
    whatsappCta: "Parler avec AUM sur WhatsApp",
    whatsappMessage: "Bonjour AUM, je veux parler avec vous sur WhatsApp.",
  },
  pt: {
    artistCta: "AUM Artist",
    close: "Fechar menu",
    menu: "Abrir menu",
    platformLabel: "Plataforma",
    projectCta: "Começar",
    whatsappCta: "Falar com AUM pelo WhatsApp",
    whatsappMessage: "Olá AUM, quero falar com você pelo WhatsApp.",
  },
};

export async function PublicHeader() {
  const locale = await getCurrentLocale();
  const copy = headerCopyByLocale[locale] ?? headerCopyByLocale.ht;
  const localizedNavItems = navItems.map((item) => ({
    href: item.href,
    label: t(locale, item.labelKey),
  }));

  return (
    <PublicHeaderClient
      copy={copy}
      currentLocale={locale}
      navItems={localizedNavItems}
      whatsappHref={buildWhatsappHref(copy.whatsappMessage)}
    />
  );
}

function buildWhatsappHref(message: string) {
  const number = getWhatsAppNumber()?.replace(/\D/g, "");

  if (!number || number.length < 8) {
    return "/contacto";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
