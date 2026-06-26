"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { requirePaidArtist } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function sendArtistSupportMessageAction(formData: FormData) {
  const { user } = await requirePaidArtist();
  const supabase = createServiceSupabaseClient();
  const message = String(formData.get("message") ?? "").trim();

  if (!supabase) {
    redirect("/artist/support?status=configuration");
  }

  if (!message) {
    redirect("/artist/support?status=missing");
  }

  const now = new Date().toISOString();
  const providerContactId = `artist:${user.id}`;
  const providerConversationId = `artist-support:${user.id}`;
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("legal_name,artist_name,phone")
    .eq("user_id", user.id)
    .maybeSingle();
  const displayName =
    profile?.artist_name ??
    profile?.legal_name ??
    user.user_metadata?.full_name ??
    user.email ??
    "Artista";

  const { data: contact, error: contactError } = await supabase
    .from("sendpulse_contacts")
    .upsert(
      {
        provider_contact_id: providerContactId,
        channel: "artist_dashboard",
        name: displayName,
        phone: profile?.phone ?? null,
        email: user.email ?? null,
        source: "artist_dashboard",
        last_seen_at: now,
        metadata: {
          user_id: user.id,
        },
      },
      { onConflict: "provider_contact_id" },
    )
    .select("id")
    .single();

  if (contactError || !contact) {
    await createAuditLog({
      actorId: user.id,
      action: "artist_support.message",
      entityType: "support_tickets",
      outcome: "failure",
      metadata: {
        error: contactError?.message ?? "contact_not_created",
      },
    });
    redirect("/artist/support?status=error");
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("sendpulse_conversations")
    .upsert(
      {
        provider_conversation_id: providerConversationId,
        contact_id: contact.id,
        channel: "artist_dashboard",
        status: "open",
        last_message_at: now,
        metadata: {
          user_id: user.id,
        },
      },
      { onConflict: "provider_conversation_id" },
    )
    .select("id")
    .single();

  if (conversationError || !conversation) {
    await createAuditLog({
      actorId: user.id,
      action: "artist_support.message",
      entityType: "support_tickets",
      outcome: "failure",
      metadata: {
        error: conversationError?.message ?? "conversation_not_created",
      },
    });
    redirect("/artist/support?status=error");
  }

  const payloadHash = createHash("sha256")
    .update(`${providerConversationId}:${now}:${message}`)
    .digest("hex");
  const { data: storedMessage, error: messageError } = await supabase
    .from("sendpulse_messages")
    .insert({
      conversation_id: conversation.id,
      contact_id: contact.id,
      provider_event_id: `artist-dashboard:${payloadHash}`,
      payload_hash: payloadHash,
      direction: "inbound",
      message_type: "text",
      body: message,
      raw_payload: {
        source: "artist_dashboard",
        user_id: user.id,
        email: user.email ?? null,
        body: message,
      },
      occurred_at: now,
    })
    .select("id")
    .single();

  if (messageError || !storedMessage) {
    await createAuditLog({
      actorId: user.id,
      action: "artist_support.message",
      entityType: "support_tickets",
      outcome: "failure",
      metadata: {
        error: messageError?.message ?? "message_not_created",
      },
    });
    redirect("/artist/support?status=error");
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .upsert(
      {
        conversation_id: conversation.id,
        contact_id: contact.id,
        status: "open",
        priority: "normal",
        subject: `Soporte artista: ${displayName}`,
        latest_message_at: now,
        created_by_source: "artist_dashboard",
        metadata: {
          user_id: user.id,
          email: user.email ?? null,
        },
      },
      { onConflict: "conversation_id" },
    )
    .select("id")
    .single();

  await createAuditLog({
    actorId: user.id,
    action: "artist_support.message",
    entityType: "support_tickets",
    entityId: ticket?.id,
    outcome: ticketError ? "failure" : "success",
    metadata: {
      conversationId: conversation.id,
      messageId: storedMessage.id,
      source: "artist_support",
      error: ticketError?.message ?? null,
    },
  });

  if (ticketError) {
    redirect("/artist/support?status=error");
  }

  revalidatePath("/artist/support");
  revalidatePath("/admin/tickets");
  redirect("/artist/support?status=sent");
}
