import { NextResponse } from "next/server";

import { createAuditLog } from "@/lib/audit";
import { canPreviewReleaseFile } from "@/lib/artist-files";
import { getUserPermissionKeys } from "@/lib/permissions";
import { createPresignedDownloadUrl } from "@/lib/r2";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseSignedDownloadUrl } from "@/lib/supabase-storage";

export const runtime = "nodejs";

type FileWithRelease = {
  id: string;
  release_id: string;
  file_type: string;
  storage_provider: "external" | "r2" | "supabase";
  storage_key: string | null;
  file_url: string | null;
  original_filename: string | null;
  status: string;
  releases?: { user_id?: string } | { user_id?: string }[] | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const [{ fileId }, supabase] = await Promise.all([
    params,
    createServerSupabaseClient(),
  ]);
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

  const url = new URL(request.url);
  const action = url.searchParams.get("action") === "listen" ? "listen" : "download";
  const { data, error } = await serviceSupabase
    .from("release_files")
    .select(
      "id,release_id,file_type,storage_provider,storage_key,file_url,original_filename,status,releases(user_id)",
    )
    .eq("id", fileId)
    .maybeSingle();
  const file = data as FileWithRelease | null;
  const release = normalizeReleaseJoin(file?.releases);

  if (error || !file || !release || file.status !== "uploaded") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const isOwner = release.user_id === user.id;
  const permissions = isOwner ? [] : await getUserPermissionKeys(user.id);
  const requiredPermission =
    action === "listen" ? "artist_files.listen" : "artist_files.download";

  if (!isOwner && !permissions.includes(requiredPermission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "listen" && !canPreviewReleaseFile(file.file_type)) {
    return NextResponse.json(
      { error: "File cannot be previewed" },
      { status: 400 },
    );
  }

  const signedUrl = await getSignedFileUrl({
    file,
    action,
  });

  if (!signedUrl) {
    return NextResponse.json(
      { error: "Could not create signed URL" },
      { status: 503 },
    );
  }

  await createAuditLog({
    actorId: user.id,
    action: action === "listen" ? "artist_files.listen" : "artist_files.download",
    entityType: "release_files",
    entityId: file.id,
    metadata: {
      releaseId: file.release_id,
      fileType: file.file_type,
      storageProvider: file.storage_provider,
      ownerAccess: isOwner,
    },
  });

  return NextResponse.redirect(signedUrl, { status: 302 });
}

async function getSignedFileUrl({
  file,
  action,
}: {
  file: FileWithRelease;
  action: "download" | "listen";
}) {
  if (file.storage_provider === "external") {
    return file.file_url;
  }

  if (!file.storage_key) {
    return null;
  }

  const disposition = action === "listen" ? "inline" : "attachment";

  if (file.storage_provider === "r2") {
    return createPresignedDownloadUrl({
      key: file.storage_key,
      fileName: file.original_filename,
      disposition,
    });
  }

  return createSupabaseSignedDownloadUrl({
    key: file.storage_key,
    download:
      action === "download" ? file.original_filename ?? true : undefined,
  });
}

function normalizeReleaseJoin(
  value:
    | { user_id?: string }
    | Array<{ user_id?: string }>
    | null
    | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
