import { PublicHeaderClient } from "@/components/public/public-header-client";
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
  }
> = {
  ht: {
    artistCta: "AUM Artist",
    close: "Fèmen meni",
    menu: "Louvri meni",
    platformLabel: "Platfòm",
    projectCta: "Kòmanse",
  },
  es: {
    artistCta: "AUM Artist",
    close: "Cerrar menú",
    menu: "Abrir menú",
    platformLabel: "Plataforma",
    projectCta: "Comenzar",
  },
  en: {
    artistCta: "AUM Artist",
    close: "Close menu",
    menu: "Open menu",
    platformLabel: "Platform",
    projectCta: "Start",
  },
  fr: {
    artistCta: "AUM Artist",
    close: "Fermer le menu",
    menu: "Ouvrir le menu",
    platformLabel: "Plateforme",
    projectCta: "Commencer",
  },
  pt: {
    artistCta: "AUM Artist",
    close: "Fechar menu",
    menu: "Abrir menu",
    platformLabel: "Plataforma",
    projectCta: "Começar",
  },
};

export async function PublicHeader() {
  const locale = await getCurrentLocale();
  const localizedNavItems = navItems.map((item) => ({
    href: item.href,
    label: t(locale, item.labelKey),
  }));

  return (
    <PublicHeaderClient
      copy={headerCopyByLocale[locale] ?? headerCopyByLocale.ht}
      currentLocale={locale}
      navItems={localizedNavItems}
    />
  );
}
