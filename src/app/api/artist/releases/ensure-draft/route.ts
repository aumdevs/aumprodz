import { NextResponse } from "next/server";

import { createAuditLog } from "@/lib/audit";
import { normalizeReleaseType } from "@/lib/artist-releases";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const editableStatuses = ["draft", "needs_changes"];

type TrackInput = {
  title: string;
  featuredArtists?: string | null;
};

type ExternalReleaseFileInput = {
  fileType: string;
  label: string;
  url: string;
};

type EnsureDraftPayload = {
  releaseId?: string | null;
  releaseType?: string | null;
  title?: string | null;
  primaryArtist?: string | null;
  featuredArtists?: string | null;
  genre?: string | null;
  language?: string | null;
  explicitContent?: boolean | null;
  desiredReleaseDate?: string | null;
  externalFilesUrl?: string | null;
  externalFiles?: ExternalReleaseFileInput[];
  relatedTrackId?: string | null;
  videoNotOwnSong?: boolean | null;
  hasLyrics?: boolean | null;
  lyricsText?: string | null;
  notes?: string | null;
  platforms?: string[];
  tracks?: string | null;
  trackFeaturedArtists?: string | null;
};

export async function POST(request: Request) {
  const sessionSupabase = await createServerSupabaseClient();
  const serviceSupabase = createServiceSupabaseClient();

  if (!sessionSupabase || !serviceSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await sessionSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as EnsureDraftPayload | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const releaseType = normalizeReleaseType(body.releaseType ?? null);
  const title = clean(body.title);
  const primaryArtist = clean(body.primaryArtist);

  if (!title || !primaryArtist) {
    return NextResponse.json(
      { error: "Título y artista principal son obligatorios." },
      { status: 400 },
    );
  }

  const [{ data: artistProfile }, existingResult] = await Promise.all([
    serviceSupabase
      .from("artist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle(),
    body.releaseId
      ? serviceSupabase
          .from("releases")
          .select("id,status,user_id")
          .eq("id", body.releaseId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const existing = existingResult.data;

  if (body.releaseId) {
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    if (!editableStatuses.includes(existing.status)) {
      return NextResponse.json(
        { error: "Este lanzamiento ya no se puede editar." },
        { status: 409 },
      );
    }
  }

  const trackTitles =
    releaseType === "single" || releaseType === "video"
      ? [title]
      : parseTracks(body.tracks ?? "", title);
  const trackFeaturedArtists =
    releaseType === "single" || releaseType === "video"
      ? [clean(body.featuredArtists)]
      : parseTrackMetadata(body.trackFeaturedArtists ?? "");
  const tracks = trackTitles.map((trackTitle, index) => ({
    title: trackTitle,
    featuredArtists: trackFeaturedArtists[index] ?? null,
  }));
  const platforms = Array.isArray(body.platforms)
    ? body.platforms.map((platform) => platform.trim()).filter(Boolean)
    : [];
  const externalFiles = normalizeExternalFiles(body.externalFiles);
  const relatedTrackId = clean(body.relatedTrackId);
  const videoNotOwnSong = Boolean(body.videoNotOwnSong);
  const verifiedRelatedTrackId =
    releaseType === "video" && relatedTrackId && !videoNotOwnSong
      ? await findOwnedTrackId({ userId: user.id, trackId: relatedTrackId })
      : null;

  if (releaseType === "video" && relatedTrackId && !videoNotOwnSong && !verifiedRelatedTrackId) {
    return NextResponse.json(
      { error: "La canción seleccionada no pertenece a tu cuenta." },
      { status: 400 },
    );
  }

  const payload = {
    user_id: user.id,
    artist_profile_id: artistProfile?.id ?? null,
    release_type: releaseType,
    title,
    primary_artist: primaryArtist,
    featured_artists: clean(body.featuredArtists),
    genre: clean(body.genre),
    language: clean(body.language),
    explicit_content: Boolean(body.explicitContent),
    desired_release_date: clean(body.desiredReleaseDate),
    external_files_url: externalFiles[0]?.url ?? clean(body.externalFilesUrl),
    notes: clean(body.notes),
    related_track_id:
      releaseType === "video" && !videoNotOwnSong ? verifiedRelatedTrackId : null,
    related_track_note:
      releaseType === "video" && videoNotOwnSong
        ? "Video independiente de canciones de la cuenta"
        : null,
    status: "draft",
    submitted_at: null,
  };

  const { data: release, error } = body.releaseId
    ? await serviceSupabase
        .from("releases")
        .update(payload)
        .eq("id", body.releaseId)
        .eq("user_id", user.id)
        .select("id")
        .single()
    : await serviceSupabase.from("releases").insert(payload).select("id").single();

  if (error || !release) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo preparar el lanzamiento." },
      { status: 500 },
    );
  }

  await replaceReleaseChildren({
    releaseId: release.id,
    tracks,
    platforms,
    externalFilesUrl: payload.external_files_url,
    externalFiles,
  });

  if (!body.releaseId) {
    await serviceSupabase.from("release_status_history").insert({
      release_id: release.id,
      changed_by: user.id,
      from_status: null,
      to_status: "draft",
      notes: "Preparado para carga de archivos",
    });
  }

  await createAuditLog({
    actorId: user.id,
    action: "releases.prepare_upload",
    entityType: "releases",
    entityId: release.id,
    outcome: "success",
    before: existing,
    after: payload,
    metadata: {
      source: "artist_inline_upload",
    },
  });

  return NextResponse.json({ releaseId: release.id });
}

async function findOwnedTrackId({
  userId,
  trackId,
}: {
  userId: string;
  trackId: string;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("release_tracks")
    .select("id,releases!inner(user_id,release_type,status)")
    .eq("id", trackId)
    .eq("releases.user_id", userId)
    .in("releases.release_type", ["single", "ep", "album"])
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function replaceReleaseChildren({
  releaseId,
  tracks,
  platforms,
  externalFilesUrl,
  externalFiles,
}: {
  releaseId: string;
  tracks: TrackInput[];
  platforms: string[];
  externalFilesUrl?: string | null;
  externalFiles: ExternalReleaseFileInput[];
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return;
  }

  await Promise.all([
    supabase.from("release_tracks").delete().eq("release_id", releaseId),
    supabase.from("release_platforms").delete().eq("release_id", releaseId),
    supabase
      .from("release_files")
      .delete()
      .eq("release_id", releaseId)
      .eq("storage_provider", "external"),
  ]);

  if (tracks.length > 0) {
    await supabase.from("release_tracks").insert(
      tracks.map((track, index) => ({
        release_id: releaseId,
        track_number: index + 1,
        title: track.title,
        featured_artists: track.featuredArtists ?? null,
      })),
    );
  }

  if (platforms.length > 0) {
    await supabase.from("release_platforms").insert(
      platforms.map((platform) => ({
        release_id: releaseId,
        platform,
      })),
    );
  }

  const links = externalFiles.length > 0
    ? externalFiles
    : externalFilesUrl
      ? [{ fileType: "external_link", label: "Link externo", url: externalFilesUrl }]
      : [];

  if (links.length > 0) {
    await supabase.from("release_files").insert(
      links.map((link) => ({
        release_id: releaseId,
        file_type: normalizeExternalFileType(link.fileType),
        storage_provider: "external",
        file_url: link.url,
        notes: link.label,
      })),
    );
  }
}

function parseTracks(value: string, fallbackTitle: string | null) {
  const tracks = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (tracks.length === 0 && fallbackTitle) {
    return [fallbackTitle];
  }

  return tracks;
}

function parseTrackMetadata(value: string) {
  return value.split(/\r?\n/).map((line) => clean(line));
}

function clean(value?: string | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeExternalFiles(
  value?: ExternalReleaseFileInput[] | null,
): ExternalReleaseFileInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      fileType: String(item.fileType ?? "external_link"),
      label: String(item.label ?? "Link externo"),
      url: String(item.url ?? "").trim(),
    }))
    .filter((item) => item.url.length > 0);
}

function normalizeExternalFileType(value: string) {
  const allowed = ["audio", "artwork", "video", "lyrics", "document", "external_link"];

  return allowed.includes(value) ? value : "external_link";
}
