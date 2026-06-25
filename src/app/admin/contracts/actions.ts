"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import {
  createUploadedContract,
  deriveArtistAccountStatus,
  normalizeContractStatus,
  normalizeIdentityStatus,
  recordLegalHistory,
  sendContractWithSignNow,
} from "@/lib/legal";
import { requirePermission } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function updateArtistLegalStatusAction(formData: FormData) {
  const { user } = await requirePermission("contracts.manage", "/admin/contracts");
  const supabase = createServiceSupabaseClient();
  const artistProfileId = String(formData.get("artist_profile_id") ?? "");
  const identityStatus = normalizeIdentityStatus(formData.get("identity_status"));
  const contractStatus = normalizeContractStatus(formData.get("contract_status"));
  const notes = String(formData.get("notes") ?? "").trim();
  const requestHeaders = await headers();
  const legalAuditMetadata = getLegalAuditMetadata(requestHeaders);

  if (!supabase || !artistProfileId) {
    redirect("/admin/contracts?status=error");
  }

  const { data: before } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("id", artistProfileId)
    .maybeSingle();

  if (!before) {
    redirect("/admin/contracts?status=not_found");
  }

  const nextProfileStatus = deriveArtistAccountStatus({
    previousStatus: before.status,
    identityStatus,
    contractStatus,
  });
  const update = {
    identity_status: identityStatus,
    contract_status: contractStatus,
    status: nextProfileStatus,
  };
  const { error } = await supabase
    .from("artist_profiles")
    .update(update)
    .eq("id", artistProfileId);

  let identityVerificationId: string | null = null;
  let contractId: string | null = null;

  if (!error && before.identity_status !== identityStatus) {
    const { data: verification } = await supabase
      .from("identity_verifications")
      .insert({
        user_id: before.user_id,
        artist_profile_id: artistProfileId,
        provider: "manual",
        status: identityStatus,
        submitted_at: new Date().toISOString(),
        verified_at:
          identityStatus === "verified" ? new Date().toISOString() : null,
        rejected_at:
          identityStatus === "rejected" ? new Date().toISOString() : null,
        metadata: {
          source: "admin_contracts",
          notes,
          ...legalAuditMetadata,
        },
      })
      .select("id")
      .single();

    identityVerificationId = verification?.id ?? null;

    await recordLegalHistory({
      userId: before.user_id,
      artistProfileId,
      entityType: "identity_verification",
      entityId: identityVerificationId,
      changedBy: user.id,
      fromStatus: before.identity_status,
      toStatus: identityStatus,
      notes: notes || "Cambio de identidad desde admin",
      metadata: { source: "admin_contracts", ...legalAuditMetadata },
    });
  }

  if (!error && before.contract_status !== contractStatus) {
    const now = new Date().toISOString();
    const { data: contract } = await supabase
      .from("artist_contracts")
      .insert({
        user_id: before.user_id,
        artist_profile_id: artistProfileId,
        provider: "manual",
        title: "AUM PRODZ Artist Agreement",
        status: contractStatus,
        sent_at: contractStatus === "sent" ? now : null,
        viewed_at: contractStatus === "viewed" ? now : null,
        signed_at: contractStatus === "signed" ? now : null,
        completed_at: contractStatus === "completed" ? now : null,
        declined_at: contractStatus === "declined" ? now : null,
        metadata: {
          source: "admin_contracts",
          notes,
          ...legalAuditMetadata,
        },
      })
      .select("id")
      .single();

    contractId = contract?.id ?? null;

    await recordLegalHistory({
      userId: before.user_id,
      artistProfileId,
      entityType: "artist_contract",
      entityId: contractId,
      changedBy: user.id,
      fromStatus: before.contract_status,
      toStatus: contractStatus,
      notes: notes || "Cambio de contrato desde admin",
      metadata: { source: "admin_contracts", ...legalAuditMetadata },
    });
  }

  await createAuditLog({
    actorId: user.id,
    action: "legal.status_update",
    entityType: "artist_profiles",
    entityId: artistProfileId,
    outcome: error ? "failure" : "success",
    before,
    after: {
      ...update,
      identity_verification_id: identityVerificationId,
      contract_id: contractId,
    },
    metadata: {
      source: "admin_contracts",
      notes,
      ...legalAuditMetadata,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/contracts");
  revalidatePath("/admin/artists");
  revalidatePath(`/artist`);
  redirect(error ? "/admin/contracts?status=error" : "/admin/contracts?status=saved");
}

export async function uploadContractPdfAction(formData: FormData) {
  const { user } = await requirePermission("contracts.upload", "/admin/contracts");
  const artistProfileId = String(formData.get("artist_profile_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("contract_file");

  if (!artistProfileId || !(file instanceof File) || file.size === 0) {
    redirect("/admin/contracts?status=upload_error");
  }

  try {
    await createUploadedContract({
      artistProfileId,
      actorId: user.id,
      title: title || "Contrato oficial AUM PRODZ",
      file,
    });
  } catch {
    redirect("/admin/contracts?status=upload_error");
  }

  revalidatePath("/admin/contracts");
  redirect("/admin/contracts?status=uploaded");
}

export async function sendContractToSignNowAction(formData: FormData) {
  const { user } = await requirePermission("contracts.send", "/admin/contracts");
  const contractId = String(formData.get("contract_id") ?? "");

  if (!contractId) {
    redirect("/admin/contracts?status=send_error");
  }

  try {
    await sendContractWithSignNow({
      contractId,
      actorId: user.id,
    });
  } catch {
    redirect("/admin/contracts?status=send_error");
  }

  revalidatePath("/admin/contracts");
  redirect("/admin/contracts?status=sent");
}

export async function updateContractStatusAction(formData: FormData) {
  const { user } = await requirePermission("contracts.manage", "/admin/contracts");
  const supabase = createServiceSupabaseClient();
  const contractId = String(formData.get("contract_id") ?? "");
  const status = normalizeContractStatus(formData.get("status"));
  const notes = String(formData.get("notes") ?? "").trim();
  const requestHeaders = await headers();
  const legalAuditMetadata = getLegalAuditMetadata(requestHeaders);

  if (!supabase || !contractId) {
    redirect("/admin/kanban?status=error");
  }

  const { data: before } = await supabase
    .from("artist_contracts")
    .select("*")
    .eq("id", contractId)
    .maybeSingle();

  if (!before) {
    redirect("/admin/kanban?status=not_found");
  }

  const now = new Date().toISOString();
  const update = {
    status,
    sent_at: status === "sent" ? before.sent_at ?? now : before.sent_at,
    viewed_at: status === "viewed" ? before.viewed_at ?? now : before.viewed_at,
    signed_at: status === "signed" ? before.signed_at ?? now : before.signed_at,
    completed_at:
      status === "completed" ? before.completed_at ?? now : before.completed_at,
    declined_at:
      status === "declined" ? before.declined_at ?? now : before.declined_at,
  };
  const { error } = await supabase
    .from("artist_contracts")
    .update(update)
    .eq("id", contractId);

  if (!error && before.artist_profile_id) {
    const { data: artistProfile } = await supabase
      .from("artist_profiles")
      .select("id,user_id,status,identity_status,contract_status")
      .eq("id", before.artist_profile_id)
      .maybeSingle();

    if (artistProfile) {
      const nextAccountStatus = deriveArtistAccountStatus({
        previousStatus: artistProfile.status,
        identityStatus: artistProfile.identity_status,
        contractStatus: status,
      });

      await supabase
        .from("artist_profiles")
        .update({
          contract_status: status,
          status: nextAccountStatus,
        })
        .eq("id", before.artist_profile_id);
    }
  }

  if (!error && before.status !== status) {
    await recordLegalHistory({
      userId: before.user_id,
      artistProfileId: before.artist_profile_id,
      entityType: "artist_contract",
      entityId: contractId,
      changedBy: user.id,
      fromStatus: before.status,
      toStatus: status,
      notes: notes || "Cambio de contrato desde kanban/admin",
      metadata: { source: "admin_contract_status", ...legalAuditMetadata },
    });
  }

  await createAuditLog({
    actorId: user.id,
    action: "contracts.status_update",
    entityType: "artist_contracts",
    entityId: contractId,
    outcome: error ? "failure" : "success",
    before,
    after: update,
    metadata: {
      source: "admin_contract_status",
      notes,
      ...legalAuditMetadata,
    },
  });

  revalidatePath("/admin/contracts");
  revalidatePath("/admin/kanban");
  redirect(error ? "/admin/kanban?status=error" : "/admin/kanban?status=saved");
}

function getLegalAuditMetadata(requestHeaders: Headers) {
  const userAgent = requestHeaders.get("user-agent") ?? null;

  return {
    signature_ip_address:
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      requestHeaders.get("x-real-ip") ??
      null,
    signature_user_agent: userAgent,
    signature_device: describeDevice(userAgent),
    signature_recorded_by: "admin_manual_update",
  };
}

function describeDevice(userAgent?: string | null) {
  if (!userAgent) {
    return null;
  }

  if (/macintosh|mac os x/i.test(userAgent)) {
    return "Mac";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/iphone|ipad|ios/i.test(userAgent)) {
    return "iPhone / iPad";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Dispositivo no identificado";
}
