import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import {
  getSendPulseEventIdentity,
  processSendPulseWebhook,
} from "@/lib/sendpulse";
import { logWebhookEvent, readWebhookSecret } from "@/lib/webhook-logs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configuredSecret = getEnv("SENDPULSE_WEBHOOK_SECRET");

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "SendPulse webhook is not configured" },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const requestSecret =
    readWebhookSecret(request) ?? requestUrl.searchParams.get("secret");

  if (requestSecret !== configuredSecret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { providerEventId, eventType } = getSendPulseEventIdentity(payload);

  await logWebhookEvent({
    provider: "sendpulse",
    providerEventId,
    eventType,
    payload,
    status: "received",
  });

  try {
    const processed = await processSendPulseWebhook(payload);

    await logWebhookEvent({
      provider: "sendpulse",
      providerEventId,
      eventType,
      payload,
      status: "processed",
    });

    return NextResponse.json({
      received: true,
      processed: true,
      eventId: processed.eventId,
      contactId: processed.contactId,
      conversationId: processed.conversationId,
      messageId: processed.messageId,
      ticketId: processed.ticketId,
      botFailureId: processed.botFailureId,
      leadScoreId: processed.leadScoreId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SendPulse webhook error";

    await logWebhookEvent({
      provider: "sendpulse",
      providerEventId,
      eventType,
      payload,
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "SendPulse webhook processing failed" },
      { status: 500 },
    );
  }
}
