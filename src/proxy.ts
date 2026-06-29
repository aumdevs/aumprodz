import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getEnv, isSupabaseConfigured } from "@/lib/env";

const protectedPrefixes = ["/admin", "/artist"];
const maintenanceBypassPrefixes = ["/api/webhooks"];
const maintenanceStaticFiles = new Set([
  "/favicon.ico",
  "/site.webmanifest",
  "/sw.js",
  "/apple-touch-icon.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
]);

export async function proxy(request: NextRequest) {
  if (shouldShowMaintenance(request)) {
    return createMaintenanceResponse(request);
  }

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

function shouldShowMaintenance(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldBypassMaintenance(pathname)) {
    return false;
  }

  const mode = String(process.env.AUM_MAINTENANCE_MODE ?? "").toLowerCase();

  if (["false", "0", "off", "no"].includes(mode)) {
    return false;
  }

  const host = getRequestHost(request);

  if (isLocalHost(host)) {
    return false;
  }

  if (["true", "1", "on", "yes"].includes(mode)) {
    return true;
  }

  return isAumProdzHost(host);
}

function shouldBypassMaintenance(pathname: string) {
  return (
    maintenanceStaticFiles.has(pathname) ||
    pathname.startsWith("/_next/") ||
    maintenanceBypassPrefixes.some((prefix) => matchesProtectedPrefix(pathname, prefix))
  );
}

function getRequestHost(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

function isLocalHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isAumProdzHost(host: string) {
  return host === "aumprodz.com" || host === "www.aumprodz.com";
}

function createMaintenanceResponse(request: NextRequest) {
  const headers = new Headers({
    "cache-control": "no-store, no-cache, must-revalidate",
    "retry-after": "3600",
    "x-robots-tag": "noindex, nofollow",
  });

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "maintenance",
        message:
          "Estamos actualizando AUM PRODZ para mejorar la experiencia. Vuelve luego.",
      },
      { headers, status: 503 },
    );
  }

  headers.set("content-type", "text/html; charset=utf-8");

  return new NextResponse(maintenanceHtml, {
    headers,
    status: 503,
  });
}

const maintenanceHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Mantenimiento temporal | AUM PRODZ</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #fff8f5;
        --card: #fffdf9;
        --ink: #2d171a;
        --muted: #736762;
        --line: #eaded6;
        --red: #e80012;
        --red-soft: rgba(232, 0, 18, 0.12);
        --shadow: rgba(45, 23, 26, 0.14);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        min-height: 100%;
      }

      body {
        margin: 0;
        min-height: 100dvh;
        overflow-x: hidden;
        background:
          radial-gradient(circle at 50% -10%, rgba(232, 0, 18, 0.14), transparent 30rem),
          radial-gradient(circle at 10% 100%, rgba(232, 0, 18, 0.08), transparent 25rem),
          linear-gradient(180deg, #fffaf7 0%, #fff3ef 52%, #fffdf9 100%),
          var(--bg);
        color: var(--ink);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: clamp(1rem, 5vw, 3rem);
      }

      body::before,
      body::after {
        position: fixed;
        inset: auto;
        z-index: -1;
        width: 22rem;
        height: 22rem;
        border-radius: 999px;
        background: rgba(232, 0, 18, 0.08);
        filter: blur(44px);
        content: "";
      }

      body::before {
        top: 8%;
        left: -8rem;
      }

      body::after {
        right: -7rem;
        bottom: 4%;
      }

      .wrap {
        display: grid;
        min-height: calc(100dvh - clamp(2rem, 10vw, 6rem));
        place-items: center;
      }

      main {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        width: min(100%, 46rem);
        border: 1px solid var(--line);
        border-radius: clamp(1.7rem, 5vw, 3.1rem);
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 248, 244, 0.9)),
          var(--card);
        box-shadow: 0 2rem 6rem var(--shadow);
        padding: clamp(1.4rem, 5vw, 2.2rem);
        text-align: center;
      }

      main::before {
        position: absolute;
        inset: 0;
        z-index: -2;
        background:
          radial-gradient(circle at 50% 22%, rgba(232, 0, 18, 0.12), transparent 21rem),
          radial-gradient(circle at 50% 100%, rgba(45, 23, 26, 0.05), transparent 18rem);
        content: "";
      }

      .panel {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: clamp(1.35rem, 4vw, 2.5rem);
        background: rgba(255, 255, 255, 0.72);
        padding: clamp(1.6rem, 7vw, 3.7rem);
      }

      .panel::before {
        position: absolute;
        inset: 8% 8% auto;
        height: 17rem;
        border-radius: 999px;
        background: rgba(232, 0, 18, 0.08);
        filter: blur(36px);
        content: "";
      }

      .logo-cloud {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: -1;
        width: min(38rem, 120vw);
        max-width: none;
        opacity: 0.085;
        filter: saturate(1.1);
        transform: translate(-50%, -50%);
      }

      .brand-row {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: #fff;
        padding: 0.75rem 1.05rem;
        color: var(--red);
        font-size: clamp(0.9rem, 2vw, 1rem);
        font-weight: 900;
        letter-spacing: 0.16em;
        box-shadow: 0 1rem 2.5rem rgba(45, 23, 26, 0.07);
      }

      .brand-row img {
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        object-fit: contain;
      }

      .code {
        display: inline-flex;
        margin: clamp(1.7rem, 6vw, 3rem) auto 0.9rem;
        border: 1px solid rgba(232, 0, 18, 0.18);
        border-radius: 999px;
        background: rgba(232, 0, 18, 0.08);
        padding: 0.42rem 0.75rem;
        color: var(--red);
        font-size: 0.8rem;
        font-weight: 900;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        color: var(--ink);
        font-size: clamp(2.15rem, 8vw, 4.9rem);
        line-height: 0.92;
        letter-spacing: 0;
      }

      h2 {
        margin: 0.85rem 0 0;
        color: var(--ink);
        font-size: clamp(1.25rem, 4vw, 2.25rem);
        line-height: 1.05;
      }

      p {
        margin: 1.15rem auto 0;
        max-width: 35rem;
        color: var(--muted);
        font-size: clamp(1.02rem, 2.8vw, 1.28rem);
        font-weight: 650;
        line-height: 1.5;
      }

      .status {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.65rem;
        margin-top: clamp(1.4rem, 5vw, 2rem);
      }

      .status span {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.76);
        padding: 0.72rem 1rem;
        color: var(--ink);
        font-size: 0.92rem;
        font-weight: 850;
        box-shadow: 0 0.8rem 2rem rgba(45, 23, 26, 0.06);
      }

      @media (max-width: 420px) {
        body {
          padding: 0.85rem;
        }

        .panel {
          min-height: calc(100dvh - 3.1rem);
          display: grid;
          align-content: center;
        }

        .brand-row {
          letter-spacing: 0.12em;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <main>
        <section class="panel" aria-label="AUM PRODZ mantenimiento">
          <img class="logo-cloud" src="/aum-prodz-logo-transparent.png" alt="" />
          <div class="brand-row">
            <img src="/aum-prodz-logo-transparent.png" alt="" />
            AUM PRODZ
          </div>
          <div class="code">503</div>
          <h1>Mantenimiento temporal</h1>
          <h2>Página en construcción</h2>
          <p>Estamos actualizando AUM PRODZ para mejorar la experiencia. Vuelve luego.</p>
          <div class="status" aria-hidden="true">
            <span>Actualizando la plataforma</span>
            <span>Volvemos pronto</span>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>`;

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
