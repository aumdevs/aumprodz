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
    artistDashboard: string;
    close: string;
    menu: string;
    privateAccess: string;
    projectCta: string;
  }
> = {
  ht: {
    artistDashboard: "Dashboard atis",
    close: "Fèmen meni",
    menu: "Louvri meni",
    privateAccess: "Aksè prive",
    projectCta: "Kòmanse yon pwojè",
  },
  es: {
    artistDashboard: "Dashboard artista",
    close: "Cerrar menú",
    menu: "Abrir menú",
    privateAccess: "Acceso privado",
    projectCta: "Comenzar proyecto",
  },
  en: {
    artistDashboard: "Artist Dashboard",
    close: "Close menu",
    menu: "Open menu",
    privateAccess: "Private access",
    projectCta: "Start a project",
  },
  fr: {
    artistDashboard: "Dashboard artiste",
    close: "Fermer le menu",
    menu: "Ouvrir le menu",
    privateAccess: "Accès privé",
    projectCta: "Commencer un projet",
  },
  pt: {
    artistDashboard: "Dashboard artista",
    close: "Fechar menu",
    menu: "Abrir menu",
    privateAccess: "Acesso privado",
    projectCta: "Começar projeto",
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
