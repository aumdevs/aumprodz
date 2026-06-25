import { createHash } from "crypto";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;
type SendPulseDirection = "inbound" | "outbound" | "system";
type ConversationStatus = "open" | "pending" | "resolved" | "archived";
type TicketPriority = "low" | "normal" | "high" | "urgent";
type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

type NormalizedSendPulsePayload = {
  eventId: string | null;
  eventType: string;
  payloadHash: string;
  contactId: string | null;
  conversationId: string | null;
  messageId: string | null;
  channel: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  source: string | null;
  direction: SendPulseDirection;
  messageType: string;
  body: string | null;
  occurredAt: string;
  conversationStatus: ConversationStatus | null;
  ticketPriority: TicketPriority | null;
  leadStatus: LeadStatus | null;
  isBotFailure: boolean;
  failureType: string | null;
  failureReason: string | null;
};

type ProcessedSendPulseWebhook = {
  eventId: string;
  eventType: string;
  contactId: string | null;
  conversationId: string | null;
  messageId: string | null;
  ticketId: string | null;
  botFailureId: string | null;
  leadScoreId: string | null;
};

const conversationStatuses: ConversationStatus[] = [
  "open",
  "pending",
  "resolved",
  "archived",
];

const ticketPriorities: TicketPriority[] = ["low", "normal", "high", "urgent"];
const leadStatuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export async function processSendPulseWebhook(
  payload: unknown,
): Promise<ProcessedSendPulseWebhook> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  const normalized = normalizeSendPulsePayload(payload);
  const contact = await upsertContact(supabase, normalized);
  const conversation = await upsertConversation(
    supabase,
    normalized,
    contact?.id ?? null,
  );
  const message = await upsertMessage(
    supabase,
    normalized,
    payload,
    contact?.id ?? null,
    conversation?.id ?? null,
  );
  const ticket = await upsertTicket(
    supabase,
    normalized,
    contact?.id ?? null,
    conversation?.id ?? null,
  );
  const botFailure = await upsertBotFailure(
    supabase,
    normalized,
    payload,
    contact?.id ?? null,
    conversation?.id ?? null,
    message?.id ?? null,
  );
  const leadScore = await upsertLeadScore(
    supabase,
    normalized,
    contact?.id ?? null,
  );

  return {
    eventId: normalized.eventId ?? normalized.payloadHash,
    eventType: normalized.eventType,
    contactId: contact?.id ?? null,
    conversationId: conversation?.id ?? null,
    messageId: message?.id ?? null,
    ticketId: ticket?.id ?? null,
    botFailureId: botFailure?.id ?? null,
    leadScoreId: leadScore?.id ?? null,
  };
}

export function getSendPulseEventIdentity(payload: unknown) {
  const payloadHash = createPayloadHash(payload);
  const normalized = normalizeSendPulsePayload(payload, payloadHash);

  return {
    providerEventId: normalized.eventId ?? payloadHash,
    eventType: normalized.eventType,
    payloadHash,
  };
}

export function createPayloadHash(payload: unknown) {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

function normalizeSendPulsePayload(
  payload: unknown,
  knownPayloadHash = createPayloadHash(payload),
): NormalizedSendPulsePayload {
  const eventType =
    getString(payload, [
      "event",
      "event_type",
      "type",
      "action",
      "data.event",
      "data.event_type",
      "data.type",
      "payload.event",
    ]) ?? "sendpulse.event";

  const eventId = getString(payload, [
    "event_id",
    "eventId",
    "webhook_id",
    "id",
    "data.event_id",
    "data.id",
    "payload.id",
  ]);

  const firstName = getString(payload, [
    "contact.first_name",
    "subscriber.first_name",
    "data.contact.first_name",
    "first_name",
  ]);
  const lastName = getString(payload, [
    "contact.last_name",
    "subscriber.last_name",
    "data.contact.last_name",
    "last_name",
  ]);
  const combinedName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const body = getString(payload, [
    "message.text",
    "message.body",
    "message.message",
    "data.message.text",
    "data.message.body",
    "payload.message.text",
    "text",
    "body",
    "content",
  ]);
  const direction = normalizeDirection(
    getString(payload, [
      "direction",
      "message.direction",
      "data.message.direction",
      "payload.direction",
    ]),
    eventType,
  );
  const occurredAt =
    normalizeDate(
      getValue(payload, [
        "created_at",
        "createdAt",
        "timestamp",
        "time",
        "date",
        "message.created_at",
        "message.timestamp",
        "data.created_at",
        "data.message.created_at",
      ]),
    ) ?? new Date().toISOString();

  const isBotFailure = detectBotFailure(payload, eventType);

  return {
    eventId,
    eventType,
    payloadHash: knownPayloadHash,
    contactId: getString(payload, [
      "contact.id",
      "contact.contact_id",
      "contact.external_id",
      "subscriber.id",
      "subscriber.contact_id",
      "user.id",
      "client.id",
      "sender.id",
      "data.contact.id",
      "data.subscriber.id",
      "contact_id",
      "contactId",
    ]),
    conversationId: getString(payload, [
      "conversation.id",
      "conversation.conversation_id",
      "chat.id",
      "chat.chat_id",
      "dialog.id",
      "data.conversation.id",
      "data.chat.id",
      "conversation_id",
      "chat_id",
      "chatId",
    ]),
    messageId: getString(payload, [
      "message.id",
      "message.message_id",
      "data.message.id",
      "data.message.message_id",
      "message_id",
      "messageId",
    ]),
    channel:
      getString(payload, [
        "channel",
        "messenger",
        "platform",
        "data.channel",
        "message.channel",
      ]) ?? "whatsapp",
    contactName:
      getString(payload, [
        "contact.name",
        "contact.full_name",
        "subscriber.name",
        "subscriber.full_name",
        "user.name",
        "client.name",
        "sender.name",
        "data.contact.name",
        "name",
      ]) ?? (combinedName || null),
    phone: normalizePhone(
      getString(payload, [
        "contact.phone",
        "contact.phone_number",
        "subscriber.phone",
        "subscriber.phone_number",
        "user.phone",
        "client.phone",
        "sender.phone",
        "data.contact.phone",
        "phone",
        "phone_number",
        "whatsapp",
      ]),
    ),
    email: normalizeEmail(
      getString(payload, [
        "contact.email",
        "subscriber.email",
        "user.email",
        "client.email",
        "data.contact.email",
        "email",
      ]),
    ),
    username: getString(payload, [
      "contact.username",
      "subscriber.username",
      "user.username",
      "client.username",
      "sender.username",
      "username",
    ]),
    source: getString(payload, ["source", "utm_source", "data.source", "payload.source"]),
    direction,
    messageType:
      getString(payload, [
        "message.type",
        "data.message.type",
        "payload.message.type",
        "message_type",
      ]) ?? "text",
    body,
    occurredAt,
    conversationStatus: normalizeConversationStatus(
      getString(payload, [
        "conversation.status",
        "chat.status",
        "data.conversation.status",
        "status",
      ]),
    ),
    ticketPriority: normalizeTicketPriority(
      getString(payload, ["priority", "ticket.priority", "data.priority"]),
    ),
    leadStatus: normalizeLeadStatus(
      getString(payload, ["lead_status", "lead.status", "data.lead_status"]),
    ),
    isBotFailure,
    failureType:
      getString(payload, [
        "failure_type",
        "fallback_type",
        "bot.failure_type",
        "data.failure_type",
      ]) ?? (isBotFailure ? "bot_fallback" : null),
    failureReason:
      getString(payload, [
        "reason",
        "error",
        "error_message",
        "failure_reason",
        "bot.reason",
        "data.reason",
      ]) ?? (isBotFailure ? eventType : null),
  };
}

async function upsertContact(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  payload: NormalizedSendPulsePayload,
) {
  if (!supabase || !hasContactSignal(payload)) {
    return null;
  }

  const values = compactRecord({
    provider_contact_id: payload.contactId,
    channel: payload.channel,
    name: payload.contactName,
    phone: payload.phone,
    email: payload.email,
    username: payload.username,
    source: payload.source,
    lead_status: payload.leadStatus,
    last_seen_at: payload.occurredAt,
    metadata: {
      last_event_type: payload.eventType,
      last_payload_hash: payload.payloadHash,
    },
  });

  if (payload.contactId) {
    const { data, error } = await supabase
      .from("sendpulse_contacts")
      .upsert(values, { onConflict: "provider_contact_id" })
      .select("id,lead_status")
      .single();

    throwIfSupabaseError("sendpulse_contacts upsert", error);
    return data as { id: string; lead_status?: string } | null;
  }

  const existing = await findExistingContact(supabase, payload);

  if (existing) {
    const { data, error } = await supabase
      .from("sendpulse_contacts")
      .update(values)
      .eq("id", existing.id)
      .select("id,lead_status")
      .single();

    throwIfSupabaseError("sendpulse_contacts update", error);
    return data as { id: string; lead_status?: string } | null;
  }

  const { data, error } = await supabase
    .from("sendpulse_contacts")
    .insert(values)
    .select("id,lead_status")
    .single();

  throwIfSupabaseError("sendpulse_contacts insert", error);
  return data as { id: string; lead_status?: string } | null;
}

async function findExistingContact(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  payload: NormalizedSendPulsePayload,
) {
  if (payload.phone) {
    const { data, error } = await supabase
      .from("sendpulse_contacts")
      .select("id,lead_status")
      .eq("phone", payload.phone)
      .maybeSingle();

    throwIfSupabaseError("sendpulse_contacts find phone", error);

    if (data) {
      return data as { id: string; lead_status?: string };
    }
  }

  if (payload.email) {
    const { data, error } = await supabase
      .from("sendpulse_contacts")
      .select("id,lead_status")
      .eq("email", payload.email)
      .maybeSingle();

    throwIfSupabaseError("sendpulse_contacts find email", error);

    if (data) {
      return data as { id: string; lead_status?: string };
    }
  }

  return null;
}

async function upsertConversation(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  payload: NormalizedSendPulsePayload,
  contactId: string | null,
) {
  if (!supabase || !hasConversationSignal(payload)) {
    return null;
  }

  const values = compactRecord({
    provider_conversation_id: payload.conversationId,
    contact_id: contactId,
    channel: payload.channel,
    status: payload.conversationStatus,
    last_message_at: hasMessageSignal(payload) ? payload.occurredAt : undefined,
    last_provider_event_id: payload.eventId ?? payload.payloadHash,
    metadata: {
      last_event_type: payload.eventType,
      last_payload_hash: payload.payloadHash,
    },
  });

  if (payload.conversationId) {
    const { data, error } = await supabase
      .from("sendpulse_conversations")
      .upsert(values, { onConflict: "provider_conversation_id" })
      .select("id,status")
      .single();

    throwIfSupabaseError("sendpulse_conversations upsert", error);
    return data as { id: string; status?: string } | null;
  }

  if (contactId) {
    const { data: existing, error: existingError } = await supabase
      .from("sendpulse_conversations")
      .select("id,status")
      .eq("contact_id", contactId)
      .in("status", ["open", "pending"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    throwIfSupabaseError("sendpulse_conversations find", existingError);

    if (existing) {
      const { data, error } = await supabase
        .from("sendpulse_conversations")
        .update(values)
        .eq("id", existing.id)
        .select("id,status")
        .single();

      throwIfSupabaseError("sendpulse_conversations update", error);
      return data as { id: string; status?: string } | null;
    }
  }

  const { data, error } = await supabase
    .from("sendpulse_conversations")
    .insert(values)
    .select("id,status")
    .single();

  throwIfSupabaseError("sendpulse_conversations insert", error);
  return data as { id: string; status?: string } | null;
}

async function upsertMessage(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  payload: NormalizedSendPulsePayload,
  rawPayload: unknown,
  contactId: string | null,
  conversationId: string | null,
) {
  if (!supabase || !hasMessageSignal(payload)) {
    return null;
  }

  const { data, error } = await supabase
    .from("sendpulse_messages")
    .upsert(
      {
        conversation_id: conversationId,
        contact_id: contactId,
        provider_message_id: payload.messageId,
        provider_event_id: payload.eventId ?? payload.payloadHash,
        payload_hash: payload.payloadHash,
        direction: payload.direction,
        message_type: payload.messageType,
        body: payload.body,
        raw_payload: rawPayload,
        occurred_at: payload.occurredAt,
      },
      { onConflict: "payload_hash" },
    )
    .select("id")
    .single();

  throwIfSupabaseError("sendpulse_messages upsert", error);
  return data as { id: string } | null;
}

async function upsertTicket(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  payload: NormalizedSendPulsePayload,
  contactId: string | null,
  conversationId: string | null,
) {
  if (!supabase || !conversationId || payload.direction !== "inbound") {
    return null;
  }

  const { data: existing, error: existingError } = await supabase
    .from("support_tickets")
    .select("id,status,priority,subject")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  throwIfSupabaseError("support_tickets find", existingError);

  const status =
    existing && ["resolved", "closed"].includes(String(existing.status))
      ? "open"
      : existing?.status ?? "new";
  const priority = payload.ticketPriority ?? existing?.priority ?? "normal";
  const subject = existing?.subject ?? buildTicketSubject(payload);
  const values = compactRecord({
    conversation_id: conversationId,
    contact_id: contactId,
    status,
    priority,
    subject,
    latest_message_at: payload.occurredAt,
    created_by_source: "sendpulse",
    resolved_at: status === "resolved" ? payload.occurredAt : null,
    closed_at: status === "closed" ? payload.occurredAt : null,
    metadata: {
      last_event_type: payload.eventType,
      last_payload_hash: payload.payloadHash,
    },
  });

  if (existing) {
    const { data, error } = await supabase
      .from("support_tickets")
      .update(values)
      .eq("id", existing.id)
      .select("id")
      .single();

    throwIfSupabaseError("support_tickets update", error);
    return data as { id: string } | null;
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert(values)
    .select("id")
    .single();

  throwIfSupabaseError("support_tickets insert", error);
  return data as { id: string } | null;
}

async function upsertBotFailure(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  payload: NormalizedSendPulsePayload,
  rawPayload: unknown,
  contactId: string | null,
  conversationId: string | null,
  messageId: string | null,
) {
  if (!supabase || !payload.isBotFailure) {
    return null;
  }

  const { data, error } = await supabase
    .from("bot_failures")
    .upsert(
      {
        conversation_id: conversationId,
        contact_id: contactId,
        message_id: messageId,
        provider_event_id: payload.eventId ?? payload.payloadHash,
        payload_hash: payload.payloadHash,
        failure_type: payload.failureType ?? "bot_fallback",
        reason: payload.failureReason,
        raw_payload: rawPayload,
      },
      { onConflict: "payload_hash" },
    )
    .select("id")
    .single();

  throwIfSupabaseError("bot_failures upsert", error);
  return data as { id: string } | null;
}

async function upsertLeadScore(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  payload: NormalizedSendPulsePayload,
  contactId: string | null,
) {
  if (!supabase || !contactId) {
    return null;
  }

  const signal = getLeadSignal(payload);
  const points = getLeadSignalPoints(signal);

  const { data: existing, error: existingError } = await supabase
    .from("lead_scores")
    .select("id,score,status,signal_count,metadata")
    .eq("contact_id", contactId)
    .maybeSingle();

  throwIfSupabaseError("lead_scores find", existingError);

  const metadata = isRecord(existing?.metadata) ? existing.metadata : {};
  const lastPayloadHash =
    typeof metadata.last_payload_hash === "string" ? metadata.last_payload_hash : null;
  const isDuplicateSignal = lastPayloadHash === payload.payloadHash;
  const score = Number(existing?.score ?? 0) + (isDuplicateSignal ? 0 : points);
  const signalCount =
    Number(existing?.signal_count ?? 0) + (isDuplicateSignal ? 0 : 1);
  const status = payload.leadStatus ?? normalizeLeadStatus(existing?.status) ?? "new";
  const values = {
    contact_id: contactId,
    score,
    status,
    signal_count: signalCount,
    last_signal: signal,
    last_activity_at: payload.occurredAt,
    metadata: {
      ...metadata,
      last_event_type: payload.eventType,
      last_payload_hash: payload.payloadHash,
    },
  };

  if (existing) {
    const { data, error } = await supabase
      .from("lead_scores")
      .update(values)
      .eq("id", existing.id)
      .select("id")
      .single();

    throwIfSupabaseError("lead_scores update", error);
    return data as { id: string } | null;
  }

  const { data, error } = await supabase
    .from("lead_scores")
    .insert(values)
    .select("id")
    .single();

  throwIfSupabaseError("lead_scores insert", error);
  return data as { id: string } | null;
}

function hasContactSignal(payload: NormalizedSendPulsePayload) {
  return Boolean(
    payload.contactId ||
      payload.contactName ||
      payload.phone ||
      payload.email ||
      payload.username,
  );
}

function hasConversationSignal(payload: NormalizedSendPulsePayload) {
  return Boolean(
    payload.conversationId ||
      hasMessageSignal(payload) ||
      payload.eventType.toLowerCase().includes("conversation") ||
      payload.eventType.toLowerCase().includes("chat"),
  );
}

function hasMessageSignal(payload: NormalizedSendPulsePayload) {
  return Boolean(
    payload.messageId ||
      payload.body ||
      payload.eventType.toLowerCase().includes("message") ||
      payload.eventType.toLowerCase().includes("incoming"),
  );
}

function getLeadSignal(payload: NormalizedSendPulsePayload) {
  if (payload.isBotFailure) {
    return "bot_failure";
  }

  if (payload.direction === "inbound" && hasMessageSignal(payload)) {
    return "inbound_message";
  }

  if (hasConversationSignal(payload)) {
    return "conversation";
  }

  return "contact";
}

function getLeadSignalPoints(signal: string) {
  if (signal === "bot_failure") {
    return 15;
  }

  if (signal === "inbound_message") {
    return 10;
  }

  if (signal === "conversation") {
    return 5;
  }

  return 1;
}

function buildTicketSubject(payload: NormalizedSendPulsePayload) {
  const body = payload.body?.trim();

  if (body) {
    return body.length > 80 ? `${body.slice(0, 77)}...` : body;
  }

  return payload.contactName
    ? `Conversacion con ${payload.contactName}`
    : "Conversacion SendPulse";
}

function normalizeDirection(
  value: string | null,
  eventType: string,
): SendPulseDirection {
  const source = `${value ?? ""} ${eventType}`.toLowerCase();

  if (
    source.includes("outbound") ||
    source.includes("sent") ||
    source.includes("operator") ||
    source.includes("bot")
  ) {
    return "outbound";
  }

  if (
    source.includes("system") ||
    source.includes("fallback") ||
    source.includes("failure") ||
    source.includes("failed") ||
    source.includes("error")
  ) {
    return "system";
  }

  return "inbound";
}

function normalizeConversationStatus(value: unknown): ConversationStatus | null {
  const status = typeof value === "string" ? value.toLowerCase() : "";
  return conversationStatuses.includes(status as ConversationStatus)
    ? (status as ConversationStatus)
    : null;
}

function normalizeTicketPriority(value: unknown): TicketPriority | null {
  const priority = typeof value === "string" ? value.toLowerCase() : "";
  return ticketPriorities.includes(priority as TicketPriority)
    ? (priority as TicketPriority)
    : null;
}

function normalizeLeadStatus(value: unknown): LeadStatus | null {
  const status = typeof value === "string" ? value.toLowerCase() : "";
  return leadStatuses.includes(status as LeadStatus) ? (status as LeadStatus) : null;
}

function normalizePhone(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d+]/g, "");
  return normalized || null;
}

function normalizeEmail(value: string | null) {
  return value ? value.trim().toLowerCase() : null;
}

function normalizeDate(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 1_000_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const numeric = Number(value);

  if (Number.isFinite(numeric)) {
    return normalizeDate(numeric);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function detectBotFailure(payload: unknown, eventType: string) {
  const directBoolean = getBoolean(payload, [
    "bot_failure",
    "bot_failed",
    "requires_human",
    "human_required",
    "need_human",
    "handoff_required",
    "data.requires_human",
  ]);

  if (directBoolean) {
    return true;
  }

  const haystack = [
    eventType,
    getString(payload, ["reason", "error", "failure_reason", "bot.reason"]),
    getString(payload, ["message.text", "message.body", "text", "body"]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return [
    "fallback",
    "bot_failure",
    "bot failed",
    "human",
    "handoff",
    "operator_required",
    "unrecognized",
    "not_understood",
    "failed",
    "error",
  ].some((keyword) => haystack.includes(keyword));
}

function getString(payload: unknown, paths: string[]) {
  const value = getValue(payload, paths);

  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function getBoolean(payload: unknown, paths: string[]) {
  const value = getValue(payload, paths);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "si"].includes(value.toLowerCase());
  }

  return false;
}

function getValue(payload: unknown, paths: string[]) {
  for (const path of paths) {
    const value = readPath(payload, path);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[part];
  }, value);
}

function compactRecord(record: JsonRecord) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null),
  );
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function throwIfSupabaseError(
  context: string,
  error: { message?: string } | null | undefined,
) {
  if (error) {
    throw new Error(`${context}: ${error.message ?? "unknown Supabase error"}`);
  }
}
