import { headers } from "next/headers";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

type LoginEventInput = {
  userId?: string | null;
  email?: string | null;
  outcome: "success" | "failure";
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordLoginEvent(input: LoginEventInput) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return;
  }

  const requestHeaders = await readRequestHeaders();
  const userAgent =
    input.userAgent ?? requestHeaders?.get("user-agent") ?? null;
  const ipAddress = input.ipAddress ?? getIpAddress(requestHeaders);

  await supabase.from("login_events").insert({
    user_id: input.userId ?? null,
    email: input.email?.trim().toLowerCase() || null,
    outcome: input.outcome,
    reason: input.reason ?? null,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: input.metadata ?? {},
  });
}

async function readRequestHeaders() {
  try {
    return await headers();
  } catch {
    return null;
  }
}

function getIpAddress(requestHeaders: { get(name: string): string | null } | null) {
  if (!requestHeaders) {
    return null;
  }

  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("cf-connecting-ip") ??
    null
  );
}
