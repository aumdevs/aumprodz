import { createHash, randomUUID } from "crypto";

import { createAuditLog } from "@/lib/audit";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type ArtistSupportUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
  };
};

type StoredSupportMessageInput = {
  user: ArtistSupportUser;
  body: string;
  messageType?: string;
  rawPayload?: Record<string, unknown>;
};

type ArtistSupportErrorResult = {
  ok: false;
  status: number;
  error: string;
};

type ArtistSupportMessageResult =
  | ArtistSupportErrorResult
  | {
      ok: true;
      message: ArtistSupportMessageRecord;
    };

type ArtistSupportThreadResult =
  | ArtistSupportErrorResult
  | {
      ok: true;
      contactId: string;
      conversationId: string;
      displayName: string;
    };

export type ArtistSupportMessageRecord = {
  id: string;
  direction: string;
  message_type: string;
  body: string | null;
  raw_payload: Record<string, unknown> | null;
  occurred_at: string;
};

export function getArtistSupportProviderConversationId(userId: string) {
  return `artist-support:${userId}`;
}

export async function createArtistSupportMessage({
  user,
  body,
  messageType = "text",
  rawPayload = {},
}: StoredSupportMessageInput): Promise<ArtistSupportMessageResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { ok: false, status: 503, error: "Supabase no está configurado." };
  }

  const cleanBody = body.trim();

  if (!cleanBody) {
    return { ok: false, status: 400, error: "Escribe un mensaje." };
  }

  const now = new Date().toISOString();
  const thread = await ensureArtistSupportThread({
    user,
    now,
  });

  if (!thread.ok) {
    return thread;
  }

  const eventId = `artist-dashboard:${randomUUID()}`;
  const payloadHash = createHash("sha256")
    .update(`${eventId}:${cleanBody}`)
    .digest("hex");
  const { data: storedMessage, error: messageError } = await supabase
    .from("sendpulse_messages")
    .insert({
      conversation_id: thread.conversationId,
      contact_id: thread.contactId,
      provider_event_id: eventId,
      payload_hash: payloadHash,
      direction: "inbound",
      message_type: messageType,
      body: cleanBody,
      raw_payload: {
        source: "artist_dashboard",
        user_id: user.id,
        email: user.email ?? null,
        body: cleanBody,
        ...rawPayload,
      },
      occurred_at: now,
    })
    .select("id,direction,message_type,body,raw_payload,occurred_at")
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

    return { ok: false, status: 500, error: "No se pudo guardar el mensaje." };
  }

  const ticket = await touchArtistSupportTicket({
    user,
    contactId: thread.contactId,
    conversationId: thread.conversationId,
    displayName: thread.displayName,
    now,
  });

  await createAuditLog({
    actorId: user.id,
    action: "artist_support.message",
    entityType: "support_tickets",
    entityId: ticket.ticketId,
    outcome: ticket.error ? "failure" : "success",
    metadata: {
      conversationId: thread.conversationId,
      messageId: storedMessage.id,
      source: "artist_support",
      messageType,
      error: ticket.error ?? null,
    },
  });

  if (ticket.error) {
    return { ok: false, status: 500, error: "No se pudo actualizar el ticket." };
  }

  return {
    ok: true,
    message: storedMessage as ArtistSupportMessageRecord,
  };
}

async function ensureArtistSupportThread({
  user,
  now,
}: {
  user: ArtistSupportUser;
  now: string;
}): Promise<ArtistSupportThreadResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { ok: false, status: 503, error: "Supabase no está configurado." };
  }

  const providerContactId = `artist:${user.id}`;
  const providerConversationId = getArtistSupportProviderConversationId(user.id);
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
    return { ok: false, status: 500, error: "No se pudo preparar el contacto." };
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
    return {
      ok: false,
      status: 500,
      error: "No se pudo preparar la conversación.",
    };
  }

  return {
    ok: true,
    contactId: contact.id as string,
    conversationId: conversation.id as string,
    displayName: String(displayName),
  };
}

async function touchArtistSupportTicket({
  user,
  contactId,
  conversationId,
  displayName,
  now,
}: {
  user: ArtistSupportUser;
  contactId: string;
  conversationId: string;
  displayName: string;
  now: string;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { error: "supabase_not_configured" };
  }

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .upsert(
      {
        conversation_id: conversationId,
        contact_id: contactId,
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

  return {
    ticketId: ticket?.id as string | undefined,
    error: error?.message,
  };
}
