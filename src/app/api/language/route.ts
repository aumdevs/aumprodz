import { NextResponse, type NextRequest } from "next/server";

import {
  localeCookieName,
  normalizeLocale,
} from "@/lib/i18n/config";
import { getAppBaseUrl } from "@/lib/env";
import { sanitizeNextPath } from "@/lib/utils";

const oneYear = 60 * 60 * 24 * 365;
const productionBaseUrl = "https://aumprodz.com";

export function GET(request: NextRequest) {
  const locale = normalizeLocale(request.nextUrl.searchParams.get("locale"));
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const shouldRedirect = !["0", "false"].includes(
    request.nextUrl.searchParams.get("redirect") ?? "",
  );
  const response = shouldRedirect
    ? NextResponse.redirect(getRedirectUrl(request, nextPath))
    : NextResponse.json({ locale });

  if (locale) {
    response.cookies.set(localeCookieName, locale, {
      httpOnly: false,
      maxAge: oneYear,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

function getRedirectUrl(request: NextRequest, nextPath: string) {
  const hostname = getRequestHostname(request);
  const canonicalBaseUrl = getAppBaseUrl();
  const baseUrl = isNetlifyHost(hostname)
    ? isLocalBaseUrl(canonicalBaseUrl)
      ? productionBaseUrl
      : canonicalBaseUrl
    : request.url;

  return new URL(nextPath, baseUrl);
}

function getRequestHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const hostname = host?.split(",")[0]?.trim().split(":")[0];

  return (hostname || request.nextUrl.hostname).toLowerCase();
}

function isNetlifyHost(hostname: string) {
  return hostname.endsWith(".netlify.app") || hostname.endsWith(".netlify.com");
}

function isLocalBaseUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;

    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}
