import { createServiceSupabaseClient } from "@/lib/supabase/server";

type WebhookLogPayload = {
  provider:
    | "stripe"
    | "sendpulse"
    | "identity"
    | "dropbox_sign"
    | "didit"
    | "signnow";
  providerEventId?: string | null;
  eventType: string;
  payload: unknown;
  status?: "received" | "processed" | "failed";
  errorMessage?: string | null;
};

export async function logWebhookEvent(payload: WebhookLogPayload) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { logged: false, reason: "supabase_service_not_configured" };
  }

  const { error } = await supabase.from("webhook_logs").upsert(
    {
      provider: payload.provider,
      provider_event_id: payload.providerEventId,
      event_type: payload.eventType,
      payload: payload.payload,
      status: payload.status ?? "received",
      error_message: payload.errorMessage ?? null,
      processed_at:
        payload.status === "processed" || payload.status === "failed"
          ? new Date().toISOString()
          : null,
    },
    {
      onConflict: "provider,provider_event_id",
      ignoreDuplicates: false,
    },
  );

  return { logged: !error, error };
}

export function readWebhookSecret(request: Request, headerName = "x-aum-webhook-secret") {
  return request.headers.get(headerName);
}
