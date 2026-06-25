"use server";

import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type ContactMessageValues = {
  name?: string;
  email?: string;
  context?: string;
  message?: string;
};

export type ContactMessageState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof ContactMessageValues, string>>;
  values?: ContactMessageValues;
};

export async function submitContactMessageAction(
  _previousState: ContactMessageState,
  formData: FormData,
): Promise<ContactMessageState> {
  const values: ContactMessageValues = {
    name: clean(formData.get("name"), 120),
    email: clean(formData.get("email"), 180)?.toLowerCase(),
    context: clean(formData.get("context"), 180),
    message: clean(formData.get("message"), 2000),
  };
  const fieldErrors = validateContactMessage(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Completa los campos marcados para enviar el mensaje.",
      fieldErrors,
      values,
    };
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      error:
        "No se pudo conectar con el panel admin. Intenta otra vez en un momento.",
      values,
    };
  }

  const now = new Date().toISOString();
  const providerContactId = `public-contact:${values.email}`;
  const providerConversationId = `public-contact:${randomUUID()}`;
  const providerMessageId = `public-contact-message:${randomUUID()}`;
  const rawPayload = {
    source: "public_contact_page",
    name: values.name,
    email: values.email,
    context: values.context,
    message: values.message,
    providerMessageId,
  };
  const payloadHash = createHash("sha256")
    .update(JSON.stringify(rawPayload))
    .digest("hex");

  const { data: contact, error: contactError } = await supabase
    .from("sendpulse_contacts")
    .upsert(
      {
        provider_contact_id: providerContactId,
        channel: "web",
        name: values.name,
        email: values.email,
        source: "public_contact_page",
        lead_status: "new",
        metadata: {
          latest_context: values.context,
        },
        last_seen_at: now,
      },
      { onConflict: "provider_contact_id" },
    )
    .select("id")
    .single();

  if (contactError || !contact) {
    return {
      error: "No se pudo guardar tu contacto. Intenta otra vez.",
      values,
    };
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("sendpulse_conversations")
    .insert({
      provider_conversation_id: providerConversationId,
      contact_id: contact.id,
      channel: "web",
      status: "open",
      last_message_at: now,
      last_provider_event_id: providerMessageId,
      metadata: {
        source: "public_contact_page",
        context: values.context,
      },
    })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    return {
      error: "No se pudo crear el mensaje en el panel admin.",
      values,
    };
  }

  const { data: message, error: messageError } = await supabase
    .from("sendpulse_messages")
    .insert({
      conversation_id: conversation.id,
      contact_id: contact.id,
      provider_message_id: providerMessageId,
      provider_event_id: providerMessageId,
      payload_hash: payloadHash,
      direction: "inbound",
      message_type: "text",
      body: values.message,
      raw_payload: rawPayload,
      occurred_at: now,
    })
    .select("id")
    .single();

  if (messageError || !message) {
    return {
      error: "No se pudo guardar el texto del mensaje.",
      values,
    };
  }

  const { error: ticketError } = await supabase.from("support_tickets").insert({
    conversation_id: conversation.id,
    contact_id: contact.id,
    status: "new",
    priority: "normal",
    subject: `Contacto directo: ${values.context}`,
    latest_message_at: now,
    created_by_source: "public_contact",
    metadata: {
      source: "public_contact_page",
      context: values.context,
      message_id: message.id,
    },
  });

  if (ticketError) {
    return {
      error: "El mensaje se guardó, pero no se pudo crear el ticket admin.",
      values,
    };
  }

  await supabase.from("lead_scores").upsert(
    {
      contact_id: contact.id,
      score: 5,
      status: "new",
      signal_count: 1,
      last_signal: "public_contact_message",
      last_activity_at: now,
      metadata: {
        source: "public_contact_page",
        context: values.context,
      },
    },
    { onConflict: "contact_id" },
  );

  revalidatePath("/admin/tickets");
  revalidatePath("/admin/leads");

  return {
    success: "Mensaje enviado. Lo veremos en el panel admin.",
    values: {},
  };
}

function validateContactMessage(values: ContactMessageValues) {
  const errors: ContactMessageState["fieldErrors"] = {};

  if (!values.name) {
    errors.name = "Escribe tu nombre.";
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Escribe un correo válido.";
  }

  if (!values.context) {
    errors.context = "Escribe el contexto.";
  }

  if (!values.message || values.message.length < 10) {
    errors.message = "Escribe un mensaje con un poco más de detalle.";
  }

  return errors;
}

function clean(value: FormDataEntryValue | null, maxLength: number) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text.slice(0, maxLength) : undefined;
}
