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

export function normalizeLanguageTag(value: string | null | undefined) {
  const language = value?.trim().toLowerCase().split("-")[0];

  return normalizeLocale(language);
}

export function getPreferredLocaleFromHeader(
  acceptLanguage: string | null | undefined,
) {
  if (!acceptLanguage) {
    return undefined;
  }

  return acceptLanguage
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [tag = "", ...params] = item.split(";").map((part) => part.trim());
      const qualityParam = params.find((param) =>
        param.toLowerCase().startsWith("q="),
      );
      const qualityValue = qualityParam?.slice(2);
      const quality = qualityValue ? Number.parseFloat(qualityValue) : 1;

      return {
        locale: normalizeLanguageTag(tag),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((item): item is { locale: AppLocale; quality: number } =>
      Boolean(item.locale) && item.quality > 0,
    )
    .sort((first, second) => second.quality - first.quality)[0]?.locale;
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function getDefaultLocaleForPath(pathname: string): AppLocale {
  return isAdminPath(pathname) ? "es" : "ht";
}

export function resolveLocaleForPath({
  acceptLanguage,
  cookieLocale,
  pathname,
}: {
  acceptLanguage?: string | null;
  cookieLocale?: string | null;
  pathname: string;
}): AppLocale {
  if (isAdminPath(pathname)) {
    return "es";
  }

  return (
    normalizeLocale(cookieLocale) ??
    getPreferredLocaleFromHeader(acceptLanguage) ??
    getDefaultLocaleForPath(pathname)
  );
}
