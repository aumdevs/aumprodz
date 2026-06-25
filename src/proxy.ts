import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getEnv, isSupabaseConfigured } from "@/lib/env";

const protectedPrefixes = ["/admin", "/artist"];

export async function proxy(request: NextRequest) {
  let response = createNextResponse(request);
  const isProtected = protectedPrefixes.some((prefix) =>
    matchesProtectedPrefix(request.nextUrl.pathname, prefix),
  );

  if (!isSupabaseConfigured()) {
    if (isProtected) {
      return redirectToLogin(request, "configuration");
    }

    return response;
  }

  const supabase = createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL")!,
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = createNextResponse(request);

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    return redirectToLogin(request, "auth");
  }

  return response;
}

function matchesProtectedPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function redirectToLogin(request: NextRequest, reason: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
}

function createNextResponse(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-aum-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
