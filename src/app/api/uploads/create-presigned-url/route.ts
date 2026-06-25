import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import {
  buildReleaseFileStorageKey,
  getMaxReleaseFileSize,
  getReleaseStorageProvider,
  isAllowedReleaseFileContentType,
  releaseFileTypes,
  resolveReleaseFileContentType,
} from "@/lib/artist-files";
import { createPresignedUploadUrl } from "@/lib/r2";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseSignedUploadUrl } from "@/lib/supabase-storage";

export const runtime = "nodejs";

const uploadSchema = z.object({
  releaseId: z.string().uuid(),
  fileType: z.enum(releaseFileTypes),
  fileName: z.string().min(1).max(180),
  contentType: z.string().min(3).max(120),
  sizeBytes: z.number().int().positive(),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const serviceSupabase = createServiceSupabaseClient();

  if (!supabase || !serviceSupabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = uploadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { releaseId, fileType, fileName, contentType, sizeBytes } = parsed.data;
  const resolvedContentType = resolveReleaseFileContentType({
    fileType,
    contentType,
    fileName,
  });
  const maxSize = getMaxReleaseFileSize(fileType);

  if (
    !isAllowedReleaseFileContentType({
      fileType,
      contentType: resolvedContentType,
    })
  ) {
    return NextResponse.json(
      { error: "File type is not allowed for this release file slot" },
      { status: 415 },
    );
  }

  if (sizeBytes > maxSize) {
    return NextResponse.json(
      { error: "File is too large for this release file slot" },
      { status: 413 },
    );
  }

  const { data: release, error: releaseError } = await serviceSupabase
    .from("releases")
    .select("id,user_id,status")
    .eq("id", releaseId)
    .maybeSingle();

  if (releaseError || !release || release.user_id !== user.id) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  if (release.status !== "draft" && release.status !== "needs_changes") {
    return NextResponse.json(
      { error: "Release is not editable" },
      { status: 409 },
    );
  }

  const storageProvider = getReleaseStorageProvider(fileType);
  const key = buildReleaseFileStorageKey({
    userId: user.id,
    releaseId,
    fileType,
    fileName,
  });
  const signedUpload =
    storageProvider === "r2"
      ? await createPresignedUploadUrl({
          key,
          contentType: resolvedContentType,
        })
      : await createSupabaseSignedUploadUrl(key);
  const signedUrl =
    typeof signedUpload === "string" ? signedUpload : signedUpload?.signedUrl;

  if (!signedUrl) {
    return NextResponse.json(
      { error: "Storage is not configured" },
      { status: 503 },
    );
  }

  const { data: file, error: fileError } = await serviceSupabase
    .from("release_files")
    .insert({
      release_id: releaseId,
      file_type: fileType,
      storage_provider: storageProvider,
      storage_key: key,
      uploaded_by: user.id,
      original_filename: fileName,
      content_type: resolvedContentType,
      size_bytes: sizeBytes,
      status: "pending_upload",
    })
    .select("id")
    .single();

  if (fileError || !file) {
    return NextResponse.json(
      { error: "Could not register upload" },
      { status: 500 },
    );
  }

  await createAuditLog({
    actorId: user.id,
    action: "artist_files.create_upload_url",
    entityType: "release_files",
    entityId: file.id,
    metadata: {
      contentType: resolvedContentType,
      fileType,
      releaseId,
      sizeBytes,
      storageKey: key,
      storageProvider,
    },
  });

  return NextResponse.json({
    fileId: file.id,
    key,
    provider: storageProvider,
    signedUrl,
    contentType: resolvedContentType,
    uploadMethod: "PUT",
    expiresIn: 600,
  });
}
