import { createHmac, timingSafeEqual } from "node:crypto";

type VerifySignNowWebhookSignatureInput = {
  headers: Headers;
  rawBody: string;
  secret: string;
};

type SignNowWebhookSignatureResult = {
  verified: boolean;
  method?: "x-signnow-signature";
  reason?: string;
};

export function hasSignNowSignatureHeaders(headers: Headers) {
  return Boolean(headers.get("x-signnow-signature"));
}

export function verifySignNowWebhookSignature({
  headers,
  rawBody,
  secret,
}: VerifySignNowWebhookSignatureInput): SignNowWebhookSignatureResult {
  const signature = headers.get("x-signnow-signature");

  if (!signature) {
    return { verified: false, reason: "missing_signature" };
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  if (!safeCompare(signature.trim(), expectedSignature)) {
    return { verified: false, reason: "invalid_signature" };
  }

  return { verified: true, method: "x-signnow-signature" };
}

export function parseSignNowWebhookPayload(rawBody: string, contentType: string) {
  if (!rawBody.trim()) {
    return {};
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams(rawBody);
    const json = form.get("json");

    if (json) {
      return JSON.parse(json);
    }

    return Object.fromEntries(form.entries());
  }

  return JSON.parse(rawBody);
}

export function mergeSignNowWebhookQueryParams(
  payload: unknown,
  searchParams: URLSearchParams,
) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  const record = { ...(payload as Record<string, unknown>) };
  const documentId =
    searchParams.get("document_id") ??
    searchParams.get("doc_id") ??
    searchParams.get("document");
  const supportedKeys = [
    "entity_id",
    "field_invite_id",
    "invite_id",
    "link_id",
  ];

  if (documentId && !record.document_id) {
    record.document_id = documentId;
  }

  for (const key of supportedKeys) {
    const value = searchParams.get(key);

    if (value && !record[key]) {
      record[key] = value;
    }
  }

  return record;
}

function safeCompare(receivedSignature: string, expectedSignature: string) {
  const received = Buffer.from(receivedSignature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
