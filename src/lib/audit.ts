import { createServiceSupabaseClient } from "@/lib/supabase/server";

type AuditPayload = {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  outcome?: "success" | "failure";
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  ipAddress?: string | null;
};

export async function createAuditLog(payload: AuditPayload) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { logged: false, reason: "supabase_service_not_configured" };
  }

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: payload.actorId ?? null,
    action: payload.action,
    entity_type: payload.entityType ?? null,
    entity_id: payload.entityId ?? null,
    outcome: payload.outcome ?? "success",
    before_data: payload.before ?? null,
    after_data: payload.after ?? null,
    metadata: payload.metadata ?? {},
    ip_address: payload.ipAddress ?? null,
  });

  return { logged: !error, error };
}
