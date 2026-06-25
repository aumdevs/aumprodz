import { createHmac, timingSafeEqual } from "node:crypto";

type VerifyDiditWebhookSignatureInput = {
  headers: Headers;
  payload: unknown;
  rawBody: string;
  secret: string;
  toleranceSeconds?: number;
};

type DiditWebhookSignatureResult = {
  verified: boolean;
  method?: "x-signature-v2" | "x-signature" | "x-signature-simple";
  reason?: string;
};

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

export function hasDiditSignatureHeaders(headers: Headers) {
  return Boolean(
    headers.get("x-signature-v2") ||
      headers.get("x-signature") ||
      headers.get("x-signature-simple"),
  );
}

export function verifyDiditWebhookSignature({
  headers,
  payload,
  rawBody,
  secret,
  toleranceSeconds = DEFAULT_TIMESTAMP_TOLERANCE_SECONDS,
}: VerifyDiditWebhookSignatureInput): DiditWebhookSignatureResult {
  const timestampHeader = headers.get("x-timestamp");

  if (!timestampHeader) {
    return { verified: false, reason: "missing_timestamp" };
  }

  const timestamp = Number.parseInt(timestampHeader, 10);

  if (!Number.isFinite(timestamp)) {
    return { verified: false, reason: "invalid_timestamp" };
  }

  const now = Math.floor(Date.now() / 1000);

  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { verified: false, reason: "stale_timestamp" };
  }

  const signatureV2 = headers.get("x-signature-v2");

  if (
    signatureV2 &&
    verifyHmacHex(signatureV2, createSignature(canonicalizeJson(payload), secret))
  ) {
    return { verified: true, method: "x-signature-v2" };
  }

  const signature = headers.get("x-signature");

  if (signature && verifyHmacHex(signature, createSignature(rawBody, secret))) {
    return { verified: true, method: "x-signature" };
  }

  const signatureSimple = headers.get("x-signature-simple");

  if (
    signatureSimple &&
    verifyHmacHex(
      signatureSimple,
      createSignature(createSimpleSignaturePayload(payload), secret),
    )
  ) {
    return { verified: true, method: "x-signature-simple" };
  }

  return { verified: false, reason: "invalid_signature" };
}

function canonicalizeJson(payload: unknown) {
  return JSON.stringify(sortObjectKeys(payload));
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
      return accumulator;
    }, {});
}

function createSimpleSignaturePayload(payload: unknown) {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return [
    stringifySignaturePart(record.timestamp),
    stringifySignaturePart(record.session_id),
    stringifySignaturePart(record.status),
    stringifySignaturePart(record.webhook_type),
  ].join(":");
}

function stringifySignaturePart(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function createSignature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

function verifyHmacHex(receivedSignature: string, expectedSignature: string) {
  const received = Buffer.from(receivedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
