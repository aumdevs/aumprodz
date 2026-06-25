export const supportedLocales = ["ht", "es", "en", "fr", "pt"] as const;
export type AppLocale = (typeof supportedLocales)[number];

export const localeCookieName = "aum_locale";

export const localeLabels: Record<AppLocale, string> = {
  ht: "Kreyol",
  es: "Espanol",
  en: "English",
  fr: "Francais",
  pt: "Portugues",
};

export function normalizeLocale(value: string | null | undefined) {
  return supportedLocales.includes(value as AppLocale)
    ? (value as AppLocale)
    : undefined;
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function getDefaultLocaleForPath(pathname: string): AppLocale {
  return isAdminPath(pathname) ? "es" : "ht";
}

export function resolveLocaleForPath({
  cookieLocale,
  pathname,
}: {
  cookieLocale?: string | null;
  pathname: string;
}): AppLocale {
  if (isAdminPath(pathname)) {
    return "es";
  }

  return normalizeLocale(cookieLocale) ?? getDefaultLocaleForPath(pathname);
}
