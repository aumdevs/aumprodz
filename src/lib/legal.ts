import { createHash, randomUUID } from "crypto";

import { createAuditLog } from "@/lib/audit";
import {
  createDiditVerificationSession,
  isDiditConfigured,
  isSignNowConfigured,
  uploadSignNowContractAndCreateLink,
} from "@/lib/legal-providers";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;

export const identityStatuses = [
  "not_started",
  "requested",
  "pending",
  "in_review",
  "verified",
  "rejected",
  "expired",
  "cancelled",
] as const;

export const contractStatuses = [
  "not_started",
  "requested",
  "draft",
  "sent",
  "viewed",
  "signed",
  "completed",
  "declined",
  "expired",
  "cancelled",
] as const;

export type IdentityStatus = (typeof identityStatuses)[number];
export type ContractStatus = (typeof contractStatuses)[number];
export type LegalStatusTone = "default" | "accent" | "muted" | "danger";

type ArtistProfileLegalState = {
  id: string;
  user_id: string;
  legal_name: string | null;
  artist_name: string | null;
  status: string;
  identity_status: string | null;
  contract_status: string | null;
};

type LegalProfileMatch = {
  userId: string;
  artistProfile: ArtistProfileLegalState;
};

export function normalizeIdentityStatus(value: unknown): IdentityStatus {
  const status = String(value ?? "").toLowerCase();

  if (identityStatuses.includes(status as IdentityStatus)) {
    return status as IdentityStatus;
  }

  return "pending";
}

export function normalizeContractStatus(value: unknown): ContractStatus {
  const status = String(value ?? "").toLowerCase();

  if (contractStatuses.includes(status as ContractStatus)) {
    return status as ContractStatus;
  }

  return "sent";
}

export function getIdentityStatusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    not_started: "No iniciada",
    requested: "Solicitada",
    pending: "Pendiente",
    in_review: "En revisión",
    verified: "Verificada",
    rejected: "Rechazada",
    expired: "Expirada",
    cancelled: "Cancelada",
  };

  return labels[status ?? ""] ?? status ?? "not_started";
}

export function getContractStatusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    not_started: "No iniciado",
    requested: "Solicitado",
    draft: "Borrador",
    sent: "Enviado",
    viewed: "Visto",
    signed: "Firmado",
    completed: "Completado",
    declined: "Rechazado",
    expired: "Expirado",
    cancelled: "Cancelado",
  };

  return labels[status ?? ""] ?? status ?? "not_started";
}

export function getLegalStatusTone(
  status: string | null | undefined,
): LegalStatusTone {
  if (status === "verified" || status === "signed" || status === "completed") {
    return "accent";
  }

  if (status === "rejected" || status === "declined" || status === "expired") {
    return "danger";
  }

  if (status === "requested" || status === "pending" || status === "in_review" || status === "sent" || status === "viewed") {
    return "default";
  }

  return "muted";
}

export function deriveArtistAccountStatus(input: {
  previousStatus?: string | null;
  identityStatus?: string | null;
  contractStatus?: string | null;
}) {
  const previousStatus = input.previousStatus ?? "active_pending_verification";
  const identityStatus = input.identityStatus ?? "not_started";
  const contractStatus = input.contractStatus ?? "not_started";
  const contractComplete =
    contractStatus === "signed" || contractStatus === "completed";

  if (identityStatus === "verified" && contractComplete) {
    return "verified_artist";
  }

  if (identityStatus === "verified") {
    return "contract_pending";
  }

  if (
    identityStatus === "requested" ||
    identityStatus === "pending" ||
    identityStatus === "in_review"
  ) {
    return "identity_pending";
  }

  if (
    previousStatus === "verified_artist" ||
    previousStatus === "contract_pending" ||
    previousStatus === "identity_verified"
  ) {
    return "identity_pending";
  }

  return previousStatus;
}

export function getLegalWebhookIdentity(payload: unknown, fallbackEventType: string) {
  const payloadHash = createLegalPayloadHash(payload);

  return {
    providerEventId:
      getString(payload, [
        "event_id",
        "event.id",
        "data.event_id",
        "event_subscription_id",
        "subscription_id",
        "webhook_id",
        "session_id",
        "data.session_id",
        "document_id",
        "data.document_id",
        "entity_id",
        "data.entity_id",
        "provider_document_id",
        "id",
        "event.event_hash",
        "event.event_id",
        "data.id",
        "payload.id",
      ]) ?? payloadHash,
    eventType:
      getString(payload, [
        "webhook_type",
        "event_type",
        "event",
        "type",
        "data.webhook_type",
        "data.event",
        "event.event_type",
        "event.type",
        "status",
        "data.status",
        "data.type",
        "payload.type",
      ]) ?? fallbackEventType,
    payloadHash,
  };
}

export async function requestIdentityVerification(input: {
  userId: string;
  actorId: string;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  const artistProfile = await getOrCreateArtistProfile(supabase, input.userId);

  if (artistProfile.identity_status === "verified") {
    await createAuditLog({
      actorId: input.actorId,
      action: "identity.request_skipped",
      entityType: "artist_profiles",
      entityId: artistProfile.id,
      outcome: "success",
      metadata: {
        reason: "already_verified",
        source: "artist_verification_page",
      },
    });

    return { status: "verified" as const, verificationUrl: null };
  }

  if (!isDiditConfigured()) {
    throw new Error("Didit is not configured.");
  }

  const previousIdentityStatus = artistProfile.identity_status ?? "not_started";
  const nextStatus: IdentityStatus = "requested";
  const nextProfileStatus = deriveArtistAccountStatus({
    previousStatus: artistProfile.status,
    identityStatus: nextStatus,
    contractStatus: artistProfile.contract_status,
  });

  const { data: account } = await supabase
    .from("profiles")
    .select("email,full_name")
    .eq("id", input.userId)
    .maybeSingle();
  const diditSession = await createDiditVerificationSession({
    userId: input.userId,
    email: account?.email ?? null,
    legalName: artistProfile.legal_name ?? account?.full_name ?? null,
    artistProfileId: artistProfile.id,
  });

  const { data: verification, error: verificationError } = await supabase
    .from("identity_verifications")
    .upsert(
      {
      user_id: input.userId,
      artist_profile_id: artistProfile.id,
      provider: "didit",
      provider_verification_id: diditSession.providerVerificationId,
      status: nextStatus,
      verification_url: diditSession.verificationUrl,
      submitted_at: new Date().toISOString(),
      expires_at: diditSession.expiresAt ?? null,
      metadata: {
        source: "artist_request",
        provider: "didit",
        raw: diditSession.raw,
      },
      },
      { onConflict: "provider_verification_id" },
    )
    .select("id")
    .single();

  throwIfSupabaseError("identity_verifications insert", verificationError);

  const { error: profileError } = await supabase
    .from("artist_profiles")
    .update({
      identity_status: nextStatus,
      status: nextProfileStatus,
    })
    .eq("id", artistProfile.id);

  throwIfSupabaseError("artist_profiles identity request", profileError);

  await recordLegalHistory({
    userId: input.userId,
    artistProfileId: artistProfile.id,
    entityType: "identity_verification",
    entityId: verification?.id ?? null,
    changedBy: input.actorId,
    fromStatus: previousIdentityStatus,
    toStatus: nextStatus,
    notes: "Solicitud enviada por artista",
    metadata: { source: "artist_verification_page" },
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "identity.request",
    entityType: "identity_verifications",
    entityId: verification?.id ?? artistProfile.id,
    outcome: "success",
    after: {
      identity_status: nextStatus,
      status: nextProfileStatus,
    },
    metadata: {
      source: "artist_verification_page",
      provider: "didit",
      verification_url: diditSession.verificationUrl,
    },
  });

  return {
    status: nextStatus,
    verificationId: verification?.id ?? null,
    verificationUrl: diditSession.verificationUrl,
  };
}

export async function createUploadedContract(input: {
  artistProfileId: string;
  actorId: string;
  title: string;
  file: File;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  if (input.file.type !== "application/pdf") {
    throw new Error("Only PDF contracts are allowed.");
  }

  const { data: artistProfile, error: artistError } = await supabase
    .from("artist_profiles")
    .select("id,user_id,legal_name,artist_name,profiles(email,full_name)")
    .eq("id", input.artistProfileId)
    .maybeSingle();

  throwIfSupabaseError("artist_profiles contract upload lookup", artistError);

  if (!artistProfile) {
    throw new Error("Artist profile not found.");
  }

  const account = normalizeProfileJoin(artistProfile.profiles);
  const safeName = sanitizeFileName(input.file.name);
  const storageKey = `contracts/${artistProfile.user_id}/${randomUUID()}-${safeName}`;
  await ensureLegalContractsBucket(supabase);

  const upload = await supabase.storage
    .from("legal-contracts")
    .upload(storageKey, input.file, {
      contentType: input.file.type,
      upsert: false,
    });

  if (upload.error) {
    throw upload.error;
  }

  const { data: contract, error: contractError } = await supabase
    .from("artist_contracts")
    .insert({
      user_id: artistProfile.user_id,
      artist_profile_id: artistProfile.id,
      provider: "signnow",
      title: input.title || "Contrato oficial AUM PRODZ",
      status: "draft",
      document_reference: storageKey,
      metadata: {
        source: "admin_contract_upload",
        storage_bucket: "legal-contracts",
        uploaded_by: input.actorId,
        original_filename: input.file.name,
        content_type: input.file.type,
        size_bytes: input.file.size,
        signer_email: account?.email ?? null,
        signer_name:
          artistProfile.legal_name ??
          artistProfile.artist_name ??
          account?.full_name ??
          null,
      },
    })
    .select("id")
    .single();

  throwIfSupabaseError("artist_contracts upload insert", contractError);

  await recordLegalHistory({
    userId: artistProfile.user_id,
    artistProfileId: artistProfile.id,
    entityType: "artist_contract",
    entityId: contract?.id ?? null,
    changedBy: input.actorId,
    fromStatus: "not_started",
    toStatus: "draft",
    notes: "Contrato PDF subido por admin",
    metadata: {
      source: "admin_contract_upload",
      original_filename: input.file.name,
      storage_key: storageKey,
    },
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "contracts.upload",
    entityType: "artist_contracts",
    entityId: contract?.id ?? input.artistProfileId,
    outcome: "success",
    metadata: {
      artist_profile_id: artistProfile.id,
      file_name: input.file.name,
      size_bytes: input.file.size,
      storage_key: storageKey,
    },
  });

  return contract?.id ?? null;
}

export async function sendContractWithSignNow(input: {
  contractId: string;
  actorId: string;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  if (!isSignNowConfigured()) {
    throw new Error("signNow is not configured.");
  }

  const { data: contract, error: contractError } = await supabase
    .from("artist_contracts")
    .select(
      "id,user_id,artist_profile_id,title,status,document_reference,metadata,artist_profiles(status,identity_status,contract_status,legal_name,artist_name),profiles(email,full_name)",
    )
    .eq("id", input.contractId)
    .maybeSingle();

  throwIfSupabaseError("artist_contracts send lookup", contractError);

  if (!contract?.document_reference) {
    throw new Error("Contract PDF is missing.");
  }

  const account = normalizeProfileJoin(contract.profiles);
  const artistProfile = normalizeArtistProfileJoin(contract.artist_profiles);
  const contractMetadata = getRecord(contract.metadata);
  const signerEmail =
    getString(contractMetadata, ["signer_email"]) ?? account?.email;

  if (!signerEmail) {
    throw new Error("Artist email is required before sending a contract.");
  }

  const download = await supabase.storage
    .from("legal-contracts")
    .download(contract.document_reference);

  if (download.error || !download.data) {
    throw download.error ?? new Error("Could not download contract PDF.");
  }

  const result = await uploadSignNowContractAndCreateLink({
    file: download.data,
    fileName:
      getString(contractMetadata, ["original_filename"]) ?? `${contract.title}.pdf`,
    signerEmail,
    signerName:
      getString(contractMetadata, ["signer_name"]) ??
      artistProfile?.legal_name ??
      artistProfile?.artist_name ??
      account?.full_name ??
      null,
  });
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("artist_contracts")
    .update({
      provider: "signnow",
      provider_signature_request_id: result.providerInviteId,
      signing_url: result.signingUrl ?? null,
      signed_document_url: result.signedDocumentUrl ?? null,
      status: "sent",
      sent_at: now,
      metadata: {
        ...contractMetadata,
        source: "signnow_send",
        provider_document_id: result.providerDocumentId,
        provider_invite_id: result.providerInviteId,
        raw: result.raw,
      },
    })
    .eq("id", contract.id);

  throwIfSupabaseError("artist_contracts signnow update", updateError);

  await supabase
    .from("artist_profiles")
    .update({
      contract_status: "sent",
      status: deriveArtistAccountStatus({
        previousStatus: artistProfile?.status,
        identityStatus: artistProfile?.identity_status,
        contractStatus: "sent",
      }),
    })
    .eq("id", contract.artist_profile_id);

  await recordLegalHistory({
    userId: contract.user_id,
    artistProfileId: contract.artist_profile_id,
    entityType: "artist_contract",
    entityId: contract.id,
    changedBy: input.actorId,
    fromStatus: contract.status,
    toStatus: "sent",
    notes: "Contrato enviado por signNow",
    metadata: {
      source: "signnow_send",
      provider_document_id: result.providerDocumentId,
      provider_invite_id: result.providerInviteId,
    },
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "contracts.send",
    entityType: "artist_contracts",
    entityId: contract.id,
    outcome: "success",
    metadata: {
      provider: "signnow",
      provider_document_id: result.providerDocumentId,
      provider_invite_id: result.providerInviteId,
      signing_url: result.signingUrl,
    },
  });

  return {
    contractId: contract.id,
    signingUrl: result.signingUrl ?? null,
  };
}

export async function processIdentityWebhook(payload: unknown) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  const identity = getLegalWebhookIdentity(payload, "identity.event");
  const status = detectIdentityStatus(payload, identity.eventType);
  const match = await matchLegalProfile(supabase, payload);
  const previousIdentityStatus = match.artistProfile.identity_status ?? "not_started";
  const nextProfileStatus = deriveArtistAccountStatus({
    previousStatus: match.artistProfile.status,
    identityStatus: status,
    contractStatus: match.artistProfile.contract_status,
  });
  const timestamp = new Date().toISOString();
  const providerVerificationId = getString(payload, [
    "session_id",
    "session.id",
    "data.session_id",
    "data.session.id",
    "verification_id",
    "verification.id",
    "identity.id",
    "data.verification_id",
    "data.id",
  ]);

  const verificationPayload = compactRecord({
    user_id: match.userId,
    artist_profile_id: match.artistProfile.id,
    provider: getString(payload, ["provider", "data.provider"]) ?? "didit",
    provider_verification_id: providerVerificationId,
    provider_event_id: identity.providerEventId,
    status,
    verification_url: getString(payload, [
      "verification_url",
      "session_url",
      "data.verification_url",
      "data.session_url",
    ]),
    verified_at: status === "verified" ? timestamp : undefined,
    rejected_at: status === "rejected" ? timestamp : undefined,
    submitted_at: status !== "not_started" ? timestamp : undefined,
    metadata: {
      event_type: identity.eventType,
      payload_hash: identity.payloadHash,
      vendor_data: getString(payload, ["vendor_data", "data.vendor_data"]),
      didit_status: getString(payload, ["status", "data.status"]),
      document_type: getString(payload, [
        "document_type",
        "data.document_type",
        "id_verifications.0.document_type",
        "data.id_verifications.0.document_type",
      ]),
      signer_name: getString(payload, [
        "signer_name",
        "signer.name",
        "signature_request.signatures.0.signer_name",
        "signature_request.signatures.0.signer_full_name",
        "data.signer_name",
      ]),
      signer_email: getString(payload, [
        "signer_email",
        "signer_email_address",
        "signer.email",
        "signature_request.signatures.0.signer_email_address",
        "data.signer_email",
      ]),
      signature_ip_address: getString(payload, [
        "signer_ip_address",
        "signer.ip_address",
        "signature_request.signatures.0.ip_address",
        "signature_request.signatures.0.signer_ip_address",
        "data.signer_ip_address",
      ]),
      signature_user_agent: getString(payload, [
        "user_agent",
        "signer.user_agent",
        "signature_request.signatures.0.user_agent",
        "signature_request.signatures.0.signer_user_agent",
        "data.user_agent",
      ]),
      signature_device: getString(payload, [
        "device",
        "signer.device",
        "signature_request.signatures.0.device",
        "data.device",
      ]),
    },
  });

  const conflictTarget = providerVerificationId
    ? "provider_verification_id"
    : "provider_event_id";
  const { data: verification, error: verificationError } = await supabase
    .from("identity_verifications")
    .upsert(verificationPayload, { onConflict: conflictTarget })
    .select("id")
    .single();

  throwIfSupabaseError("identity_verifications webhook upsert", verificationError);

  const { error: profileError } = await supabase
    .from("artist_profiles")
    .update({
      identity_status: status,
      status: nextProfileStatus,
    })
    .eq("id", match.artistProfile.id);

  throwIfSupabaseError("artist_profiles identity webhook", profileError);

  await recordLegalHistory({
    userId: match.userId,
    artistProfileId: match.artistProfile.id,
    entityType: "identity_verification",
    entityId: verification?.id ?? null,
    changedBy: null,
    fromStatus: previousIdentityStatus,
    toStatus: status,
    notes: "Actualización desde webhook de identidad",
    metadata: {
      event_type: identity.eventType,
      provider_event_id: identity.providerEventId,
    },
  });

  await createAuditLog({
    action: "identity.webhook_update",
    entityType: "identity_verifications",
    entityId: verification?.id ?? match.artistProfile.id,
    outcome: "success",
    after: {
      identity_status: status,
      status: nextProfileStatus,
    },
    metadata: {
      provider_event_id: identity.providerEventId,
      event_type: identity.eventType,
    },
  });

  return {
    userId: match.userId,
    artistProfileId: match.artistProfile.id,
    verificationId: verification?.id ?? null,
    status,
  };
}

export async function processContractWebhook(payload: unknown) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  const identity = getLegalWebhookIdentity(payload, "signnow.event");
  const status = detectContractStatus(payload, identity.eventType);
  const match = await matchLegalProfile(supabase, payload);
  const previousContractStatus = match.artistProfile.contract_status ?? "not_started";
  const nextProfileStatus = deriveArtistAccountStatus({
    previousStatus: match.artistProfile.status,
    identityStatus: match.artistProfile.identity_status,
    contractStatus: status,
  });
  const timestamp = new Date().toISOString();
  const signatureRequestId = getString(payload, [
    "provider_invite_id",
    "invite_id",
    "data.invite_id",
    "field_invite_id",
    "data.field_invite_id",
    "link_id",
    "data.link_id",
    "signature_request.signature_request_id",
    "signature_request_id",
    "data.signature_request_id",
    "payload.signature_request_id",
  ]);
  const providerDocumentId = getString(payload, [
    "document_id",
    "data.document_id",
    "entity_id",
    "data.entity_id",
    "meta.document_id",
    "metadata.document_id",
    "document.id",
    "payload.document_id",
  ]);
  const previousMetadata = await getExistingContractMetadata(
    supabase,
    signatureRequestId,
    providerDocumentId,
  );

  const contractPayload = compactRecord({
    user_id: match.userId,
    artist_profile_id: match.artistProfile.id,
    provider: getString(payload, ["provider", "data.provider"]) ?? "signnow",
    provider_signature_request_id: signatureRequestId,
    provider_event_id: identity.providerEventId,
    title:
      getString(payload, [
        "signature_request.title",
        "title",
        "data.title",
      ]) ?? "AUM PRODZ Artist Agreement",
    status,
    signing_url: getString(payload, [
      "signing_url",
      "url",
      "anonymous_url",
      "data.url",
      "signature_request.signing_url",
      "data.signing_url",
    ]),
    signed_document_url: getString(payload, [
      "signed_document_url",
      "signature_request.files_url",
      "data.signed_document_url",
    ]),
    sent_at: status === "sent" ? timestamp : undefined,
    viewed_at: status === "viewed" ? timestamp : undefined,
    signed_at: status === "signed" ? timestamp : undefined,
    completed_at: status === "completed" ? timestamp : undefined,
    declined_at: status === "declined" ? timestamp : undefined,
    metadata: {
      ...previousMetadata,
      event_type: identity.eventType,
      payload_hash: identity.payloadHash,
      provider_document_id: providerDocumentId,
      provider_invite_id: signatureRequestId,
      signer_name: getString(payload, [
        "signer_name",
        "data.signer_name",
        "signer.name",
        "user.name",
      ]),
      signer_email: getString(payload, [
        "signer_email",
        "data.signer_email",
        "signer.email",
        "user.email",
        "email",
      ]),
      signature_ip_address: getString(payload, [
        "ip_address",
        "signature_ip_address",
        "data.ip_address",
        "data.signature_ip_address",
      ]),
      signature_user_agent: getString(payload, [
        "user_agent",
        "data.user_agent",
      ]),
    },
  });

  const conflictTarget = signatureRequestId
    ? "provider_signature_request_id"
    : "provider_event_id";
  const { data: contract, error: contractError } = await supabase
    .from("artist_contracts")
    .upsert(contractPayload, { onConflict: conflictTarget })
    .select("id")
    .single();

  throwIfSupabaseError("artist_contracts webhook upsert", contractError);

  const { error: profileError } = await supabase
    .from("artist_profiles")
    .update({
      contract_status: status,
      status: nextProfileStatus,
    })
    .eq("id", match.artistProfile.id);

  throwIfSupabaseError("artist_profiles contract webhook", profileError);

  await recordLegalHistory({
    userId: match.userId,
    artistProfileId: match.artistProfile.id,
    entityType: "artist_contract",
    entityId: contract?.id ?? null,
    changedBy: null,
    fromStatus: previousContractStatus,
    toStatus: status,
    notes: "Actualización desde webhook de firma",
    metadata: {
      event_type: identity.eventType,
      provider_event_id: identity.providerEventId,
    },
  });

  await createAuditLog({
    action: "contracts.webhook_update",
    entityType: "artist_contracts",
    entityId: contract?.id ?? match.artistProfile.id,
    outcome: "success",
    after: {
      contract_status: status,
      status: nextProfileStatus,
    },
    metadata: {
      provider_event_id: identity.providerEventId,
      event_type: identity.eventType,
    },
  });

  return {
    userId: match.userId,
    artistProfileId: match.artistProfile.id,
    contractId: contract?.id ?? null,
    status,
  };
}

export async function recordLegalHistory(input: {
  userId: string;
  artistProfileId: string | null;
  entityType: "artist_profile" | "identity_verification" | "artist_contract";
  entityId?: string | null;
  changedBy?: string | null;
  fromStatus?: string | null;
  toStatus: string;
  notes?: string | null;
  metadata?: unknown;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("legal_status_history").insert({
    user_id: input.userId,
    artist_profile_id: input.artistProfileId,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    changed_by: input.changedBy ?? null,
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function readWebhookPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    const json = formData.get("json");

    if (typeof json === "string") {
      return JSON.parse(json);
    }

    return Object.fromEntries(formData.entries());
  }

  const text = await request.text();

  if (!text.trim()) {
    return {};
  }

  return JSON.parse(text);
}

function detectIdentityStatus(payload: unknown, eventType: string): IdentityStatus {
  const direct = getString(payload, [
    "status",
    "session.status",
    "verification.status",
    "identity.status",
    "data.status",
    "data.session.status",
    "payload.status",
  ]);

  if (direct) {
    return normalizeIdentityStatus(mapIdentityKeyword(direct));
  }

  return normalizeIdentityStatus(mapIdentityKeyword(eventType));
}

function detectContractStatus(payload: unknown, eventType: string): ContractStatus {
  const direct = getString(payload, [
    "status",
    "event",
    "event_type",
    "signature_request.status",
    "signature_request.is_complete",
    "data.status",
    "data.event",
    "payload.status",
  ]);

  if (direct === "true") {
    return "completed";
  }

  if (direct === "false") {
    return "sent";
  }

  if (direct) {
    return normalizeContractStatus(mapContractKeyword(direct));
  }

  return normalizeContractStatus(mapContractKeyword(eventType));
}

function mapIdentityKeyword(value: string) {
  const source = value.toLowerCase();

  if (
    source.includes("verified") ||
    source.includes("approved") ||
    source.includes("success")
  ) {
    return "verified";
  }

  if (
    source.includes("reject") ||
    source.includes("decline") ||
    source.includes("declined") ||
    source.includes("fail")
  ) {
    return "rejected";
  }

  if (source.includes("review")) {
    return "in_review";
  }

  if (
    source.includes("progress") ||
    source.includes("awaiting") ||
    source.includes("resubmitted")
  ) {
    return "pending";
  }

  if (source.includes("expire")) {
    return "expired";
  }

  if (source.includes("cancel")) {
    return "cancelled";
  }

  if (source.includes("request")) {
    return "requested";
  }

  if (source.includes("not started")) {
    return "requested";
  }

  return "pending";
}

function mapContractKeyword(value: string) {
  const source = value.toLowerCase();

  if (
    source.includes("all_signed") ||
    source.includes("complete") ||
    source.includes("document.completed")
  ) {
    return "completed";
  }

  if (source.includes("signed") || source.includes("document.signed")) {
    return "signed";
  }

  if (source.includes("view")) {
    return "viewed";
  }

  if (source.includes("decline") || source.includes("reject")) {
    return "declined";
  }

  if (source.includes("expire")) {
    return "expired";
  }

  if (source.includes("cancel")) {
    return "cancelled";
  }

  if (source.includes("draft")) {
    return "draft";
  }

  if (source.includes("request")) {
    return "requested";
  }

  return "sent";
}

async function matchLegalProfile(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  payload: unknown,
): Promise<LegalProfileMatch> {
  const userId = getString(payload, [
    "user_id",
    "vendor_data",
    "data.vendor_data",
    "session.vendor_data",
    "metadata.user_id",
    "data.metadata.user_id",
    "custom_fields.user_id",
    "client_reference_id",
    "reference_id",
    "external_id",
    "data.user_id",
    "payload.user_id",
    "signature_request.metadata.user_id",
  ]);

  if (userId) {
    const profile = await getArtistProfileByUserId(supabase, userId);

    if (profile) {
      return { userId, artistProfile: profile };
    }
  }

  const email = getString(payload, [
    "email",
    "user.email",
    "contact.email",
    "data.email",
    "payload.email",
    "signer_email_address",
    "signer_email",
    "signature_request.signatures.0.signer_email_address",
    "metadata.signer_email",
    "data.signer_email",
  ]);

  if (email) {
    const { data: profileRecord, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    throwIfSupabaseError("profiles legal match", profileError);

    if (profileRecord?.id) {
      const profile = await getArtistProfileByUserId(supabase, profileRecord.id);

      if (profile) {
        return { userId: profileRecord.id, artistProfile: profile };
      }
    }
  }

  const contract = await matchContractProfile(supabase, payload);

  if (contract) {
    return contract;
  }

  throw new Error("Could not match legal webhook to an artist profile.");
}

async function matchContractProfile(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  payload: unknown,
): Promise<LegalProfileMatch | null> {
  const providerDocumentId = getString(payload, [
    "document_id",
    "data.document_id",
    "entity_id",
    "data.entity_id",
    "meta.document_id",
    "metadata.document_id",
    "document.id",
    "payload.document_id",
  ]);
  const providerSignatureRequestId = getString(payload, [
    "provider_invite_id",
    "invite_id",
    "data.invite_id",
    "field_invite_id",
    "data.field_invite_id",
    "link_id",
    "data.link_id",
    "signature_request.signature_request_id",
    "signature_request_id",
    "data.signature_request_id",
    "payload.signature_request_id",
  ]);

  if (providerDocumentId) {
    const match =
      (await getContractMatchByMetadata(
        supabase,
        "provider_document_id",
        providerDocumentId,
      )) ??
      (await getContractMatch(
      supabase,
      "provider_document_id",
      providerDocumentId,
      ));

    if (match) {
      return match;
    }
  }

  if (providerSignatureRequestId) {
    const match =
      (await getContractMatch(
        supabase,
        "provider_signature_request_id",
        providerSignatureRequestId,
      )) ??
      (await getContractMatch(
        supabase,
        "provider_invite_id",
        providerSignatureRequestId,
      ));

    if (match) {
      return match;
    }
  }

  return null;
}

async function getExistingContractMetadata(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  providerSignatureRequestId: string | null,
  providerDocumentId: string | null,
) {
  const match =
    (providerSignatureRequestId
      ? await getContractMetadataByColumn(
          supabase,
          "provider_signature_request_id",
          providerSignatureRequestId,
        )
      : null) ??
    (providerDocumentId
      ? await getContractMetadataByMetadata(
          supabase,
          "provider_document_id",
          providerDocumentId,
        )
      : null);

  return match ?? {};
}

async function getContractMetadataByColumn(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  column: "provider_signature_request_id" | "provider_event_id",
  value: string,
) {
  const { data, error } = await supabase
    .from("artist_contracts")
    .select("metadata")
    .eq(column, value)
    .maybeSingle();

  throwIfSupabaseError("artist_contracts metadata lookup", error);
  return getRecord(data?.metadata);
}

async function getContractMetadataByMetadata(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  key: string,
  value: string,
) {
  const { data, error } = await supabase
    .from("artist_contracts")
    .select("metadata")
    .filter(`metadata->>${key}`, "eq", value)
    .maybeSingle();

  throwIfSupabaseError("artist_contracts metadata lookup", error);
  return getRecord(data?.metadata);
}

async function getContractMatch(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  column: "provider_document_id" | "provider_signature_request_id" | "provider_invite_id",
  value: string,
): Promise<LegalProfileMatch | null> {
  const { data, error } = await supabase
    .from("artist_contracts")
    .select("user_id")
    .eq(column, value)
    .maybeSingle();

  if (error && isMissingColumnError(error.message)) {
    return null;
  }

  throwIfSupabaseError("artist_contracts legal match", error);

  if (!data?.user_id) {
    return null;
  }

  const profile = await getArtistProfileByUserId(supabase, data.user_id);

  if (!profile) {
    return null;
  }

  return { userId: data.user_id, artistProfile: profile };
}

async function getContractMatchByMetadata(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  key: string,
  value: string,
): Promise<LegalProfileMatch | null> {
  const { data, error } = await supabase
    .from("artist_contracts")
    .select("user_id")
    .filter(`metadata->>${key}`, "eq", value)
    .maybeSingle();

  throwIfSupabaseError("artist_contracts legal match metadata", error);

  if (!data?.user_id) {
    return null;
  }

  const profile = await getArtistProfileByUserId(supabase, data.user_id);

  if (!profile) {
    return null;
  }

  return { userId: data.user_id, artistProfile: profile };
}

async function ensureLegalContractsBucket(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
) {
  const { error } = await supabase.storage.createBucket("legal-contracts", {
    public: false,
    fileSizeLimit: 26214400,
    allowedMimeTypes: ["application/pdf"],
  });

  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw error;
  }
}

function getRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isMissingColumnError(message: string) {
  return /column .* does not exist/i.test(message);
}

async function getOrCreateArtistProfile(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  userId: string,
) {
  const existing = await getArtistProfileByUserId(supabase, userId);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("artist_profiles")
    .insert({
      user_id: userId,
      status: "active_pending_verification",
      identity_status: "not_started",
      contract_status: "not_started",
    })
    .select("id,user_id,legal_name,artist_name,status,identity_status,contract_status")
    .single();

  throwIfSupabaseError("artist_profiles create legal", error);
  return data as ArtistProfileLegalState;
}

async function getArtistProfileByUserId(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("artist_profiles")
    .select("id,user_id,legal_name,artist_name,status,identity_status,contract_status")
    .eq("user_id", userId)
    .maybeSingle();

  throwIfSupabaseError("artist_profiles legal lookup", error);
  return data as ArtistProfileLegalState | null;
}

function createLegalPayloadHash(payload: unknown) {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
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

    const arrayIndex = Number(part);

    if (Array.isArray(current) && Number.isInteger(arrayIndex)) {
      return current[arrayIndex];
    }

    return current[part];
  }, value);
}

function compactRecord(record: JsonRecord) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null),
  );
}

function normalizeProfileJoin(
  value:
    | { email?: string | null; full_name?: string | null }
    | Array<{ email?: string | null; full_name?: string | null }>
    | null
    | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeArtistProfileJoin(
  value:
    | {
        status?: string | null;
        identity_status?: string | null;
        contract_status?: string | null;
        legal_name?: string | null;
        artist_name?: string | null;
      }
    | Array<{
        status?: string | null;
        identity_status?: string | null;
        contract_status?: string | null;
        legal_name?: string | null;
        artist_name?: string | null;
      }>
    | null
    | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "contrato.pdf";
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
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
