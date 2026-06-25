import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const completeSchema = z.object({
  fileId: z.string().uuid(),
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

  const parsed = completeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid completion request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: file, error: fileError } = await serviceSupabase
    .from("release_files")
    .select("id,release_id,file_type,status,storage_provider,storage_key,releases(user_id,status)")
    .eq("id", parsed.data.fileId)
    .maybeSingle();

  const release = normalizeReleaseJoin(file?.releases);

  if (fileError || !file || !release || release.user_id !== user.id) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (release.status !== "draft" && release.status !== "needs_changes") {
    return NextResponse.json(
      { error: "Release is not editable" },
      { status: 409 },
    );
  }

  if (file.status !== "pending_upload") {
    return NextResponse.json(
      { error: "File is not pending upload" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const isReplacingSingleSlot = file.file_type === "artwork" || file.file_type === "video";

  if (isReplacingSingleSlot) {
    await serviceSupabase
      .from("release_files")
      .update({
        status: "replaced",
        replaced_at: now,
        replaced_by: user.id,
      })
      .eq("release_id", file.release_id)
      .eq("file_type", file.file_type)
      .eq("status", "uploaded")
      .neq("id", file.id);
  }

  const { data: updatedFile, error: updateError } = await serviceSupabase
    .from("release_files")
    .update({
      status: "uploaded",
      uploaded_at: now,
    })
    .eq("id", file.id)
    .select("id,release_id,file_type,storage_provider,storage_key,status")
    .single();

  if (updateError || !updatedFile) {
    return NextResponse.json(
      { error: "Could not complete upload" },
      { status: 500 },
    );
  }

  await createAuditLog({
    actorId: user.id,
    action: isReplacingSingleSlot ? "artist_files.replace" : "artist_files.upload",
    entityType: "release_files",
    entityId: updatedFile.id,
    metadata: {
      releaseId: updatedFile.release_id,
      fileType: updatedFile.file_type,
      storageProvider: updatedFile.storage_provider,
      storageKey: updatedFile.storage_key,
    },
  });

  return NextResponse.json({ file: updatedFile });
}

function normalizeReleaseJoin(
  value:
    | { user_id?: string; status?: string }
    | Array<{ user_id?: string; status?: string }>
    | null
    | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
