import { NextResponse } from "next/server";

import {
  hasDiditSignatureHeaders,
  verifyDiditWebhookSignature,
} from "@/lib/didit-webhooks";
import { getEnv } from "@/lib/env";
import {
  getLegalWebhookIdentity,
  processIdentityWebhook,
} from "@/lib/legal";
import { logWebhookEvent, readWebhookSecret } from "@/lib/webhook-logs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configuredSecret =
    getEnv("DIDIT_WEBHOOK_SECRET") ?? getEnv("IDENTITY_WEBHOOK_SECRET");

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Identity webhook is not configured" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  let payload: unknown;

  try {
    payload = rawBody.trim() ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const requestUrl = new URL(request.url);
  const diditSignedRequest = hasDiditSignatureHeaders(request.headers);
  const signature = diditSignedRequest
    ? verifyDiditWebhookSignature({
        headers: request.headers,
        payload,
        rawBody,
        secret: configuredSecret,
      })
    : null;
  const requestSecret =
    !diditSignedRequest &&
    (readWebhookSecret(request) ?? requestUrl.searchParams.get("secret"));

  if (!signature?.verified && requestSecret !== configuredSecret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const { providerEventId, eventType } = getLegalWebhookIdentity(
    payload,
    "didit.event",
  );

  await logWebhookEvent({
    provider: "didit",
    providerEventId,
    eventType,
    payload,
    status: "received",
  });

  try {
    const processed = await processIdentityWebhook(payload);

    await logWebhookEvent({
      provider: "didit",
      providerEventId,
      eventType,
      payload,
      status: "processed",
    });

    return NextResponse.json({
      received: true,
      processed: true,
      artistProfileId: processed.artistProfileId,
      verificationId: processed.verificationId,
      status: processed.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown identity webhook error";

    await logWebhookEvent({
      provider: "didit",
      providerEventId,
      eventType,
      payload,
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "Identity webhook processing failed" },
      { status: 500 },
    );
  }
}
