import { NextResponse, type NextRequest } from "next/server";

import {
  localeCookieName,
  normalizeLocale,
} from "@/lib/i18n/config";
import { sanitizeNextPath } from "@/lib/utils";

const oneYear = 60 * 60 * 24 * 365;

export function GET(request: NextRequest) {
  const locale = normalizeLocale(request.nextUrl.searchParams.get("locale"));
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(nextPath, request.url));

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
