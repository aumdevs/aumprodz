import type { SupabaseClient } from "@supabase/supabase-js";

import { getReleaseTypeBadgeLabel } from "@/lib/artist-releases";

export type ArtistSongOption = {
  id: string;
  label: string;
  title: string;
  releaseTitle: string;
  releaseType: string;
  trackNumber: number | null;
};

type ReleaseRow = {
  id: string;
  release_type: string;
  title: string;
  status: string;
  created_at: string;
};

type TrackRow = {
  id: string;
  release_id: string;
  title: string;
  track_number: number | null;
};

export async function listArtistSongOptions({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<ArtistSongOption[]> {
  const { data: releaseRows } = await supabase
    .from("releases")
    .select("id,release_type,title,status,created_at")
    .eq("user_id", userId)
    .in("release_type", ["single", "ep", "album"])
    .order("created_at", { ascending: false });

  const releases = ((releaseRows ?? []) as ReleaseRow[]).filter(
    (release) =>
      release.status !== "draft" &&
      release.status !== "rejected" &&
      release.status !== "cancelled",
  );
  const releaseIds = releases.map((release) => release.id);

  if (releaseIds.length === 0) {
    return [];
  }

  const { data: trackRows } = await supabase
    .from("release_tracks")
    .select("id,release_id,title,track_number")
    .in("release_id", releaseIds)
    .order("track_number", { ascending: true });

  const releasesById = new Map(
    releases.map((release) => [release.id, release]),
  );

  return ((trackRows ?? []) as TrackRow[])
    .map((track) => {
      const release = releasesById.get(track.release_id);

      if (!release) {
        return null;
      }

      const typeLabel = getReleaseTypeBadgeLabel(release.release_type);
      const trackNumber =
        release.release_type === "single" ? null : track.track_number;
      const labelParts = [
        track.title,
        release.title,
        typeLabel,
        trackNumber ? `Canción ${trackNumber}` : null,
      ].filter(Boolean);

      return {
        id: track.id,
        label: labelParts.join(" · "),
        title: track.title,
        releaseTitle: release.title,
        releaseType: release.release_type,
        trackNumber,
      };
    })
    .filter((option): option is ArtistSongOption => Boolean(option));
}
