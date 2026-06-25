import { NextResponse } from "next/server";

import { createAuditLog } from "@/lib/audit";
import { artistSmallFilesBucket } from "@/lib/artist-files";
import { uploadR2Object } from "@/lib/r2";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const editableStatuses = ["draft", "needs_changes"];

type ReleaseFileJoin = {
  id: string;
  release_id: string;
  storage_provider: "r2" | "supabase" | "external";
  storage_key: string | null;
  content_type: string | null;
  size_bytes: number | null;
  status: string;
  original_filename: string | null;
  releases:
    | { user_id?: string | null; status?: string | null }
    | { user_id?: string | null; status?: string | null }[]
    | null;
};

type UploadFileLike = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name?: string;
  size: number;
  type?: string;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const serviceSupabase = createServiceSupabaseClient();

  if (!supabase || !serviceSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const fileId = String(formData?.get("fileId") ?? "");
  const fileEntry = formData?.get("file");

  if (!fileId || !isUploadFileLike(fileEntry)) {
    return NextResponse.json(
      {
        error: "Invalid upload payload",
        details: {
          hasFileId: Boolean(fileId),
          fileEntryType: fileEntry === null ? "null" : typeof fileEntry,
        },
      },
      { status: 400 },
    );
  }

  const file = fileEntry;

  const { data, error } = await serviceSupabase
    .from("release_files")
    .select(
      "id,release_id,storage_provider,storage_key,content_type,size_bytes,status,original_filename,releases!inner(user_id,status)",
    )
    .eq("id", fileId)
    .maybeSingle();

  const releaseFile = data as ReleaseFileJoin | null;
  const release = Array.isArray(releaseFile?.releases)
    ? releaseFile?.releases[0]
    : releaseFile?.releases;

  if (
    error ||
    !releaseFile ||
    !release ||
    release.user_id !== user.id ||
    !editableStatuses.includes(release.status ?? "")
  ) {
    return NextResponse.json({ error: "Release file not found" }, { status: 404 });
  }

  if (releaseFile.status !== "pending_upload") {
    return NextResponse.json(
      { error: "This file upload is not pending" },
      { status: 409 },
    );
  }

  if (!releaseFile.storage_key || releaseFile.storage_provider === "external") {
    return NextResponse.json({ error: "Storage target is invalid" }, { status: 400 });
  }

  if (releaseFile.size_bytes && file.size > releaseFile.size_bytes) {
    return NextResponse.json({ error: "Uploaded file size changed" }, { status: 400 });
  }

  const contentType =
    releaseFile.content_type || file.type || "application/octet-stream";
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (releaseFile.storage_provider === "r2") {
    const result = await uploadR2Object({
      key: releaseFile.storage_key,
      body: bytes,
      contentType,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "R2 upload failed" },
        { status: 503 },
      );
    }
  } else {
    const { error: uploadError } = await serviceSupabase.storage
      .from(artistSmallFilesBucket)
      .upload(releaseFile.storage_key, bytes, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 503 });
    }
  }

  const uploadedAt = new Date().toISOString();
  const { error: updateError } = await serviceSupabase
    .from("release_files")
    .update({
      status: "uploaded",
      uploaded_at: uploadedAt,
      content_type: contentType,
      size_bytes: file.size,
    })
    .eq("id", releaseFile.id);

  if (updateError) {
    return NextResponse.json({ error: "Could not complete upload" }, { status: 500 });
  }

  await createAuditLog({
    actorId: user.id,
    action: "artist_files.upload",
    entityType: "release_files",
    entityId: releaseFile.id,
    outcome: "success",
    metadata: {
      fallback: "server_proxy",
      releaseId: releaseFile.release_id,
      sizeBytes: file.size,
      storageProvider: releaseFile.storage_provider,
    },
  });

  return NextResponse.json({ fileId: releaseFile.id, status: "uploaded" });
}

function isUploadFileLike(value: unknown): value is UploadFileLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "size" in value &&
    typeof value.size === "number"
  );
}
