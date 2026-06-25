import { NextResponse, type NextRequest } from "next/server";

import { recordLoginEvent } from "@/lib/login-events";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (!supabase || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=callback&next=${encodeURIComponent(next)}`, request.url),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    await recordLoginEvent({
      outcome: "failure",
      reason: "auth_callback",
      userAgent: request.headers.get("user-agent"),
      ipAddress: getIpAddress(request),
      metadata: {
        message: error.message,
        next,
      },
    });

    return NextResponse.redirect(
      new URL(`/login?error=callback&next=${encodeURIComponent(next)}`, request.url),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await recordLoginEvent({
    userId: user?.id ?? null,
    email: user?.email ?? null,
    outcome: "success",
    reason: "auth_callback",
    userAgent: request.headers.get("user-agent"),
    ipAddress: getIpAddress(request),
    metadata: { next },
  });

  return NextResponse.redirect(new URL(next, request.url));
}

function getIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  );
}
