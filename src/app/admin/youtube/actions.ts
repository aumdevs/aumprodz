"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { isMissingYoutubeVideosTableError } from "@/lib/content/youtube";
import { requirePermission } from "@/lib/permissions";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

const youtubeMediaBucket = "public-media";
const allowedThumbnailTypes = ["image/jpeg", "image/png", "image/webp"];

export async function createYoutubeVideoAction(formData: FormData) {
  const { user } = await requirePermission("content.manage", "/admin/youtube");
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/admin/youtube?status=error");
  }

  await redirectIfYoutubeVideosTableMissing(supabase);

  const payload = await readYoutubePayload(formData);

  if (!isValidYoutubePayload(payload)) {
    redirect("/admin/youtube?status=missing");
  }

  const { data, error } = await supabase
    .from("youtube_videos")
    .insert(payload)
    .select("id")
    .single();

  await createAuditLog({
    actorId: user.id,
    action: "youtube_videos.create",
    entityType: "youtube_videos",
    entityId: data?.id,
    outcome: error ? "failure" : "success",
    after: payload,
    metadata: { source: "admin_youtube" },
  });

  revalidateYoutubePaths();
  redirect(error ? "/admin/youtube?status=error" : "/admin/youtube?status=saved");
}

export async function updateYoutubeVideoAction(formData: FormData) {
  const { user } = await requirePermission("content.manage", "/admin/youtube");
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "");

  if (!supabase || !id) {
    redirect("/admin/youtube?status=error");
  }

  await redirectIfYoutubeVideosTableMissing(supabase);

  const payload = await readYoutubePayload(formData);

  if (!isValidYoutubePayload(payload)) {
    redirect("/admin/youtube?status=missing");
  }

  const { data: before } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase
    .from("youtube_videos")
    .update(payload)
    .eq("id", id);

  await createAuditLog({
    actorId: user.id,
    action: "youtube_videos.update",
    entityType: "youtube_videos",
    entityId: id,
    outcome: error ? "failure" : "success",
    before,
    after: payload,
    metadata: { source: "admin_youtube" },
  });

  revalidateYoutubePaths();
  redirect(error ? "/admin/youtube?status=error" : "/admin/youtube?status=saved");
}

export async function deleteYoutubeVideoAction(formData: FormData) {
  const { user } = await requirePermission("content.manage", "/admin/youtube");
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "");

  if (!supabase || !id) {
    redirect("/admin/youtube?status=error");
  }

  await redirectIfYoutubeVideosTableMissing(supabase);

  const { data: before } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!before) {
    redirect("/admin/youtube?status=not_found");
  }

  const { error } = await supabase.from("youtube_videos").delete().eq("id", id);

  await createAuditLog({
    actorId: user.id,
    action: "youtube_videos.delete",
    entityType: "youtube_videos",
    entityId: id,
    outcome: error ? "failure" : "success",
    before,
    metadata: { source: "admin_youtube" },
  });

  revalidateYoutubePaths();
  redirect(error ? "/admin/youtube?status=error" : "/admin/youtube?status=deleted");
}

async function readYoutubePayload(formData: FormData) {
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const thumbnailUrl = await resolveThumbnailUrl(formData);

  return {
    title: String(formData.get("title") ?? "").trim(),
    thumbnail_url: thumbnailUrl,
    video_url: String(formData.get("video_url") ?? "").trim(),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    published_at: null,
    is_active: formData.get("is_active") === "on",
  };
}

function isValidYoutubePayload(
  payload: Awaited<ReturnType<typeof readYoutubePayload>>,
) {
  return (
    payload.title.length > 0 &&
    isValidHttpUrl(payload.thumbnail_url) &&
    isValidYoutubeUrl(payload.video_url)
  );
}

async function redirectIfYoutubeVideosTableMissing(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
) {
  const { error } = await supabase.from("youtube_videos").select("id").limit(1);

  if (isMissingYoutubeVideosTableError(error)) {
    redirect("/admin/youtube?status=missing_table");
  }
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidYoutubeUrl(value: string) {
  if (!isValidHttpUrl(value)) {
    return false;
  }

  const host = new URL(value).hostname.replace(/^www\./, "");

  return host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com";
}

async function resolveThumbnailUrl(formData: FormData) {
  const file = formData.get("thumbnail_file");

  if (file instanceof File && file.size > 0) {
    return uploadThumbnail(file);
  }

  return String(formData.get("thumbnail_url") ?? "").trim();
}

async function uploadThumbnail(file: File) {
  const serviceSupabase = createServiceSupabaseClient();

  if (!serviceSupabase || !allowedThumbnailTypes.includes(file.type)) {
    return "";
  }

  await ensureYoutubeMediaBucket();

  const extension = getImageExtension(file);
  const key = `youtube-thumbnails/${randomUUID()}.${extension}`;
  const { error } = await serviceSupabase.storage
    .from(youtubeMediaBucket)
    .upload(key, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return "";
  }

  const { data } = serviceSupabase.storage
    .from(youtubeMediaBucket)
    .getPublicUrl(key);

  return data.publicUrl;
}

async function ensureYoutubeMediaBucket() {
  const serviceSupabase = createServiceSupabaseClient();

  if (!serviceSupabase) {
    return;
  }

  const { error } = await serviceSupabase.storage.createBucket(youtubeMediaBucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: allowedThumbnailTypes,
  });

  if (
    error &&
    !/already exists|duplicate|Bucket already exists/i.test(error.message)
  ) {
    throw error;
  }
}

function getImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function revalidateYoutubePaths() {
  revalidatePath("/");
  revalidatePath("/youtube");
  revalidatePath("/admin/youtube");
}
