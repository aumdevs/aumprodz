import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import {
  getLegalWebhookIdentity,
  processContractWebhook,
} from "@/lib/legal";
import {
  hasSignNowSignatureHeaders,
  mergeSignNowWebhookQueryParams,
  parseSignNowWebhookPayload,
  verifySignNowWebhookSignature,
} from "@/lib/signnow-webhooks";
import { logWebhookEvent, readWebhookSecret } from "@/lib/webhook-logs";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "signnow",
    endpoint: "/api/webhooks/sign",
  });
}

export async function POST(request: Request) {
  const configuredSecret =
    getEnv("SIGNNOW_WEBHOOK_SECRET") ?? getEnv("DROPBOX_SIGN_WEBHOOK_SECRET");

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "signNow webhook is not configured" },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const rawBody = await request.text();
  let payload: unknown;

  try {
    payload = mergeSignNowWebhookQueryParams(
      parseSignNowWebhookPayload(
        rawBody,
        request.headers.get("content-type") ?? "",
      ),
      requestUrl.searchParams,
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const signNowSignedRequest = hasSignNowSignatureHeaders(request.headers);
  const signature = signNowSignedRequest
    ? verifySignNowWebhookSignature({
        headers: request.headers,
        rawBody,
        secret: configuredSecret,
      })
    : null;
  const requestSecret =
    !signNowSignedRequest &&
    (readWebhookSecret(request) ?? requestUrl.searchParams.get("secret"));

  if (!signature?.verified && requestSecret !== configuredSecret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const { providerEventId, eventType } = getLegalWebhookIdentity(
    payload,
    "signnow.event",
  );

  await logWebhookEvent({
    provider: "signnow",
    providerEventId,
    eventType,
    payload,
    status: "received",
  });

  try {
    const processed = await processContractWebhook(payload);

    await logWebhookEvent({
      provider: "signnow",
      providerEventId,
      eventType,
      payload,
      status: "processed",
    });

    return NextResponse.json({
      received: true,
      processed: true,
      artistProfileId: processed.artistProfileId,
      contractId: processed.contractId,
      status: processed.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown contract webhook error";

    await logWebhookEvent({
      provider: "signnow",
      providerEventId,
      eventType,
      payload,
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "signNow webhook processing failed" },
      { status: 500 },
    );
  }
}
