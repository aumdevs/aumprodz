"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const ticketStatuses = ["new", "open", "pending", "resolved", "closed"] as const;
const ticketPriorities = ["low", "normal", "high", "urgent"] as const;

type TicketStatus = (typeof ticketStatuses)[number];
type TicketPriority = (typeof ticketPriorities)[number];

export async function updateTicketAction(formData: FormData) {
  const { user } = await requirePermission("tickets.manage", "/admin/tickets");
  const supabase = createServiceSupabaseClient();
  const ticketId = String(formData.get("ticket_id") ?? "");
  const status = normalizeTicketStatus(formData.get("status"));
  const priority = normalizeTicketPriority(formData.get("priority"));

  if (!supabase || !ticketId) {
    redirect("/admin/tickets?status=error");
  }

  const { data: before } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();

  if (!before) {
    redirect("/admin/tickets?status=not_found");
  }

  const now = new Date().toISOString();
  const update = {
    status,
    priority,
    resolved_at: status === "resolved" ? now : null,
    closed_at: status === "closed" ? now : null,
  };

  const { error } = await supabase
    .from("support_tickets")
    .update(update)
    .eq("id", ticketId);

  await createAuditLog({
    actorId: user.id,
    action: "tickets.update",
    entityType: "support_tickets",
    entityId: ticketId,
    outcome: error ? "failure" : "success",
    before,
    after: update,
    metadata: {
      source: "admin_tickets",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  redirect(error ? "/admin/tickets?status=error" : "/admin/tickets?status=saved");
}

function normalizeTicketStatus(value: FormDataEntryValue | null): TicketStatus {
  const status = String(value ?? "").toLowerCase();

  return ticketStatuses.includes(status as TicketStatus)
    ? (status as TicketStatus)
    : "open";
}

function normalizeTicketPriority(value: FormDataEntryValue | null): TicketPriority {
  const priority = String(value ?? "").toLowerCase();

  return ticketPriorities.includes(priority as TicketPriority)
    ? (priority as TicketPriority)
    : "normal";
}
