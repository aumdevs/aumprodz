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
  const [pathname, cookieStore] = await Promise.all([
    getRequestPathname(),
    cookies(),
  ]);

  return resolveLocaleForPath({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    pathname,
  });
}

export async function getLocaleForPath(pathname: string): Promise<AppLocale> {
  const cookieStore = await cookies();

  return resolveLocaleForPath({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    pathname,
  });
}
