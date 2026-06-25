import { getAppBaseUrl, getEnv, getRequiredEnv } from "@/lib/env";

type JsonRecord = Record<string, unknown>;

export type DiditSessionResult = {
  providerVerificationId: string;
  verificationUrl: string;
  expiresAt?: string | null;
  raw: unknown;
};

export type SignNowSendResult = {
  providerDocumentId: string;
  providerInviteId?: string | null;
  signingUrl?: string | null;
  signedDocumentUrl?: string | null;
  raw: unknown;
};

export function isDiditConfigured() {
  return Boolean(
    getEnv("DIDIT_API_KEY") &&
      getEnv("DIDIT_WORKFLOW_ID") &&
      getEnv("DIDIT_WEBHOOK_SECRET"),
  );
}

export function isSignNowConfigured() {
  return Boolean(
    (getEnv("SIGNNOW_API_KEY") || getEnv("SIGNNOW_BASIC_TOKEN")) &&
      getEnv("SIGNNOW_WEBHOOK_SECRET") &&
      getEnv("SIGNNOW_API_BASE_URL"),
  );
}

export async function createDiditVerificationSession(input: {
  userId: string;
  email?: string | null;
  legalName?: string | null;
  artistProfileId?: string | null;
}) {
  const apiKey = getRequiredEnv("DIDIT_API_KEY");
  const workflowId = getRequiredEnv("DIDIT_WORKFLOW_ID");
  const baseUrl = trimTrailingSlash(
    getEnv("DIDIT_API_BASE_URL") ?? "https://verification.didit.me",
  );
  const appBaseUrl = trimTrailingSlash(getAppBaseUrl());
  const callback = `${appBaseUrl}/artist/verification?status=returned`;
  const response = await fetch(`${baseUrl}/v3/session/`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      vendor_data: input.userId,
      callback,
      metadata: {
        user_id: input.userId,
        artist_profile_id: input.artistProfileId,
        legal_name: input.legalName,
        email: input.email,
        source: "aum_prodz_artist_dashboard",
      },
      contact_details: {
        email: input.email ?? undefined,
      },
    }),
  });

  const payload = await readProviderJson(response);

  if (!response.ok) {
    throw new Error(readProviderError(payload, "Didit session failed"));
  }

  const providerVerificationId =
    getString(payload, ["session_id", "id", "data.session_id"]) ?? input.userId;
  const verificationUrl = getString(payload, [
    "verification_url",
    "session_url",
    "url",
    "data.verification_url",
    "data.session_url",
  ]);

  if (!verificationUrl) {
    throw new Error("Didit did not return a verification URL.");
  }

  return {
    providerVerificationId,
    verificationUrl,
    expiresAt: getString(payload, ["expires_at", "data.expires_at"]),
    raw: payload,
  } satisfies DiditSessionResult;
}

export async function uploadSignNowContractAndCreateLink(input: {
  file: Blob;
  fileName: string;
  signerEmail: string;
  signerName?: string | null;
  redirectUrl?: string | null;
}) {
  const document = await uploadSignNowDocument(input.file, input.fileName);
  const link = await createSignNowSigningLink({
    documentId: document.providerDocumentId,
    redirectUrl: input.redirectUrl,
  });

  return {
    providerDocumentId: document.providerDocumentId,
    providerInviteId: link.providerInviteId ?? null,
    signingUrl: link.signingUrl ?? null,
    signedDocumentUrl: link.signedDocumentUrl ?? null,
    raw: {
      document: document.raw,
      link: link.raw,
      signer_email: input.signerEmail,
      signer_name: input.signerName,
    },
  } satisfies SignNowSendResult;
}

async function uploadSignNowDocument(file: Blob, fileName: string) {
  const formData = new FormData();

  formData.append("file", file, fileName);

  const response = await fetch(`${getSignNowBaseUrl()}/document`, {
    method: "POST",
    headers: getSignNowAuthHeaders(),
    body: formData,
  });
  const payload = await readProviderJson(response);

  if (!response.ok) {
    throw new Error(readProviderError(payload, "signNow document upload failed"));
  }

  const providerDocumentId = getString(payload, ["id", "document_id"]);

  if (!providerDocumentId) {
    throw new Error("signNow did not return a document id.");
  }

  return {
    providerDocumentId,
    raw: payload,
  };
}

async function createSignNowSigningLink(input: {
  documentId: string;
  redirectUrl?: string | null;
}) {
  const response = await fetch(`${getSignNowBaseUrl()}/link`, {
    method: "POST",
    headers: {
      ...getSignNowAuthHeaders(),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      document_id: input.documentId,
      redirect_uri: input.redirectUrl ?? `${trimTrailingSlash(getAppBaseUrl())}/artist/contract`,
    }),
  });
  const payload = await readProviderJson(response);

  if (!response.ok) {
    throw new Error(readProviderError(payload, "signNow signing link failed"));
  }

  return {
    providerInviteId: getString(payload, ["id", "link_id"]),
    signingUrl: getString(payload, ["url", "link", "anonymous_url", "data.url"]),
    signedDocumentUrl: getString(payload, ["download_url", "document_url"]),
    raw: payload,
  };
}

function getSignNowBaseUrl() {
  return trimTrailingSlash(getEnv("SIGNNOW_API_BASE_URL") ?? "https://api.signnow.com");
}

function getSignNowAuthHeaders() {
  const apiKey = getEnv("SIGNNOW_API_KEY");

  if (apiKey) {
    return { Authorization: `Bearer ${apiKey}` };
  }

  return { Authorization: `Basic ${getRequiredEnv("SIGNNOW_BASIC_TOKEN")}` };
}

async function readProviderJson(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as JsonRecord;
  } catch {
    return { raw: text };
  }
}

function readProviderError(payload: unknown, fallback: string) {
  return (
    getString(payload, [
      "detail",
      "message",
      "error",
      "errors.0.message",
      "description",
    ]) ?? fallback
  );
}

function getString(payload: unknown, paths: string[]) {
  for (const path of paths) {
    const value = readPath(payload, path);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return null;
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    const arrayIndex = Number(part);

    if (Array.isArray(current) && Number.isInteger(arrayIndex)) {
      return current[arrayIndex];
    }

    return (current as JsonRecord)[part];
  }, value);
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
