import { createServerSupabaseClient } from "@/lib/supabase/server";

export const youtubeVideosMigrationHint =
  "Falta aplicar la migración de YouTube CMS: supabase/migrations/202606250001_youtube_videos_cms.sql";

export type PublicYoutubeVideo = {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  is_active: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
};

export async function getPublicYoutubeVideos(limit = 3) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("youtube_videos")
    .select("id,title,thumbnail_url,video_url,is_active,sort_order,published_at,created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []) as PublicYoutubeVideo[];
}

export async function getAdminYoutubeVideos() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { videos: [], errors: ["Supabase no está configurado."] };
  }

  const { data, error } = await supabase
    .from("youtube_videos")
    .select("id,title,thumbnail_url,video_url,is_active,sort_order,published_at,created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return {
    videos: (data ?? []) as PublicYoutubeVideo[],
    errors: error
      ? [
          isMissingYoutubeVideosTableError(error)
            ? youtubeVideosMigrationHint
            : error.message,
        ]
      : [],
  };
}

export function isMissingYoutubeVideosTableError(error?: {
  code?: string | null;
  message?: string | null;
} | null) {
  return (
    error?.code === "PGRST205" &&
    /public\.youtube_videos|youtube_videos/i.test(error.message ?? "")
  );
}
