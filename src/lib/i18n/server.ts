import { cookies, headers } from "next/headers";

import {
  localeCookieName,
  resolveLocaleForPath,
  type AppLocale,
} from "@/lib/i18n/config";

export async function getRequestPathname() {
  const requestHeaders = await headers();

  return requestHeaders.get("x-aum-pathname") ?? "/";
}

export async function getCurrentLocale(): Promise<AppLocale> {
  const [requestHeaders, pathname, cookieStore] = await Promise.all([
    headers(),
    getRequestPathname(),
    cookies(),
  ]);

  return resolveLocaleForPath({
    acceptLanguage: requestHeaders.get("accept-language"),
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    pathname,
  });
}

export async function getLocaleForPath(pathname: string): Promise<AppLocale> {
  const [requestHeaders, cookieStore] = await Promise.all([
    headers(),
    cookies(),
  ]);

  return resolveLocaleForPath({
    acceptLanguage: requestHeaders.get("accept-language"),
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    pathname,
  });
}
