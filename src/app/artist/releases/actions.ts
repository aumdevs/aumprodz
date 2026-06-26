"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { pickBestArtistAnnualSubscription } from "@/lib/artist-billing";
import {
  canSubmitRelease,
  getRequiredPaymentProductKey,
  normalizeReleaseType,
} from "@/lib/artist-releases";
import { requirePaidArtist } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type TrackInput = {
  title: string;
  featuredArtists?: string | null;
};

type ExternalReleaseFileInput = {
  fileType: string;
  label: string;
  url: string;
};

export async function saveReleaseAction(formData: FormData) {
  const { user } = await requirePaidArtist();
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    redirect("/artist/releases/new?status=configuration");
  }

  const releaseId = clean(formData.get("id"));
  const intent = String(formData.get("intent") ?? "draft");
  const wantsSubmit = intent === "submit";
  const wantsFiles = intent === "draft_files";
  const releaseType = normalizeReleaseType(formData.get("release_type"));
  const title = clean(formData.get("title"));
  const primaryArtist = clean(formData.get("primary_artist"));
  const externalFilesUrl = clean(formData.get("external_files_url"));
  const externalFiles = parseExternalReleaseFiles(formData);
  const relatedTrackId = clean(formData.get("related_track_id"));
  const videoNotOwnSong = formData.get("video_not_own_song") === "on";
  const platforms = formData
    .getAll("platforms")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const trackTitles =
    releaseType === "single" || releaseType === "video"
      ? title
        ? [title]
        : []
      : parseTracks(String(formData.get("tracks") ?? ""), title);
  const trackFeaturedArtists =
    releaseType === "single" || releaseType === "video"
      ? [clean(formData.get("featured_artists"))]
      : parseTrackMetadata(String(formData.get("track_featured_artists") ?? ""));
  const tracks = trackTitles.map((trackTitle, index) => ({
    title: trackTitle,
    featuredArtists: trackFeaturedArtists[index] ?? null,
  }));
  const pagePath = releaseId
    ? `/artist/releases/${releaseId}`
    : "/artist/releases/new";

  if (!title || !primaryArtist) {
    redirect(`${pagePath}?status=missing`);
  }

  const [{ data: artistProfile }, { data: subscriptions }] = await Promise.all([
    supabase
      .from("artist_profiles")
      .select("id,status,identity_status,contract_status")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("artist_subscriptions")
      .select("status,current_period_start,current_period_end,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const subscription = pickBestArtistAnnualSubscription(subscriptions);

  let before: {
    id: string;
    status: string;
    user_id: string;
    submitted_at?: string | null;
    created_at: string;
  } | null = null;

  if (releaseId) {
    const { data: existing } = await supabase
      .from("releases")
      .select("id,status,user_id,submitted_at,created_at")
      .eq("id", releaseId)
      .maybeSingle();

    if (!existing || existing.user_id !== user.id) {
      redirect("/artist/releases?status=not_found");
    }

    if (!canModifyExistingRelease(existing)) {
      redirect(`/artist/releases/${releaseId}?status=locked`);
    }

    before = existing;
  }

  const requiredPaymentKey = getRequiredPaymentProductKey(releaseType);
  const availablePayment = requiredPaymentKey
    ? await findAvailablePayment({
        userId: user.id,
        productKey: requiredPaymentKey,
        releaseId,
      })
    : null;
  const hasUploadedFiles = releaseId
    ? await hasUploadedReleaseFiles({
        userId: user.id,
        releaseId,
      })
    : false;
  const hasRequiredPayment = requiredPaymentKey ? Boolean(availablePayment) : true;
  const verifiedRelatedTrackId =
    releaseType === "video" && relatedTrackId && !videoNotOwnSong
      ? await findOwnedTrackId({ userId: user.id, trackId: relatedTrackId })
      : null;

  if (releaseType === "video" && relatedTrackId && !videoNotOwnSong && !verifiedRelatedTrackId) {
    redirect(`${pagePath}?status=missing_submit`);
  }

  if (wantsSubmit) {
    if (
      (!externalFilesUrl && externalFiles.length === 0 && !hasUploadedFiles) ||
      platforms.length === 0 ||
      tracks.length === 0 ||
      (releaseType === "video" && !videoNotOwnSong && !relatedTrackId)
    ) {
      redirect(`${pagePath}?status=missing_submit`);
    }

    const allowed = canSubmitRelease({
      subscriptionStatus: subscription?.status,
      subscriptionCurrentPeriodEnd: subscription?.current_period_end,
      identityStatus: artistProfile?.identity_status,
      contractStatus: artistProfile?.contract_status,
      hasRequiredPayment,
    });

    if (!allowed) {
      redirect(`${pagePath}?status=blocked`);
    }
  }

  const payload = {
    user_id: user.id,
    artist_profile_id: artistProfile?.id ?? null,
    release_type: releaseType,
    title,
    primary_artist: primaryArtist,
    featured_artists: clean(formData.get("featured_artists")),
    genre: clean(formData.get("genre")),
    language: clean(formData.get("language")),
    explicit_content: formData.get("explicit_content") === "on",
    desired_release_date: clean(formData.get("desired_release_date")),
    external_files_url: externalFiles[0]?.url ?? externalFilesUrl,
    notes: clean(formData.get("notes")),
    related_track_id:
      releaseType === "video" && !videoNotOwnSong ? verifiedRelatedTrackId : null,
    related_track_note:
      releaseType === "video" && videoNotOwnSong
        ? "Video independiente de canciones de la cuenta"
        : null,
    status: wantsSubmit ? "submitted" : "draft",
    submitted_at: wantsSubmit
      ? before?.status === "submitted" && before.submitted_at
        ? before.submitted_at
        : new Date().toISOString()
      : null,
  };

  const { data: release, error } = releaseId
    ? await supabase
        .from("releases")
        .update(payload)
        .eq("id", releaseId)
        .eq("user_id", user.id)
        .select("id,status")
        .single()
    : await supabase.from("releases").insert(payload).select("id,status").single();

  if (error || !release) {
    await createAuditLog({
      actorId: user.id,
      action: wantsSubmit ? "releases.submit" : "releases.save_draft",
      entityType: "releases",
      entityId: releaseId ?? undefined,
      outcome: "failure",
      before,
      after: payload,
      metadata: {
        error: error?.message,
      },
    });

    redirect(`${pagePath}?status=error`);
  }

  await replaceReleaseChildren({
    releaseId: release.id,
    tracks,
    platforms,
    externalFilesUrl,
    externalFiles,
  });

  if (wantsSubmit && availablePayment?.id) {
    await supabase
      .from("artist_payments")
      .update({ release_id: release.id })
      .eq("id", availablePayment.id)
      .eq("user_id", user.id);
  }

  if (!releaseId || before?.status !== payload.status) {
    await supabase.from("release_status_history").insert({
      release_id: release.id,
      changed_by: user.id,
      from_status: before?.status ?? null,
      to_status: payload.status,
      notes: wantsSubmit ? "Enviado por artista" : "Preparación guardada",
    });
  }

  await createAuditLog({
    actorId: user.id,
    action: wantsSubmit ? "releases.submit" : "releases.save_draft",
    entityType: "releases",
    entityId: release.id,
    outcome: "success",
    before,
    after: payload,
    metadata: {
      requiredPaymentKey,
      attachedPaymentId: wantsSubmit ? availablePayment?.id ?? null : null,
      source: "artist_releases",
    },
  });

  revalidatePath("/artist");
  revalidatePath("/artist/releases");
  revalidatePath(`/artist/releases/${release.id}`);
  redirect(
    wantsSubmit
      ? `/artist/releases/${release.id}?status=submitted`
      : wantsFiles
        ? `/artist/releases/${release.id}?status=files`
      : `/artist/releases/${release.id}?status=saved`,
  );
}

async function findAvailablePayment({
  userId,
  productKey,
  releaseId,
}: {
  userId: string;
  productKey: string;
  releaseId?: string | null;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  if (releaseId) {
    const { data: linked } = await supabase
      .from("artist_payments")
      .select("id")
      .eq("user_id", userId)
      .eq("product_key", productKey)
      .eq("status", "paid")
      .eq("release_id", releaseId)
      .maybeSingle();

    if (linked) {
      return linked;
    }
  }

  const { data } = await supabase
    .from("artist_payments")
    .select("id")
    .eq("user_id", userId)
    .eq("product_key", productKey)
    .eq("status", "paid")
    .is("release_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
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

async function hasUploadedReleaseFiles({
  userId,
  releaseId,
}: {
  userId: string;
  releaseId: string;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { data } = await supabase
    .from("release_files")
    .select("id,releases!inner(user_id)")
    .eq("release_id", releaseId)
    .eq("status", "uploaded")
    .in("storage_provider", ["r2", "supabase"])
    .eq("releases.user_id", userId)
    .limit(1)
    .maybeSingle();

  return Boolean(data?.id);
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
  return value.split(/\r?\n/).map((line) => cleanText(line));
}

function parseExternalReleaseFiles(formData: FormData): ExternalReleaseFileInput[] {
  const types = formData.getAll("external_file_type").map((value) => String(value));
  const labels = formData.getAll("external_file_label").map((value) => String(value));
  const urls = formData.getAll("external_file_url").map((value) => String(value).trim());

  return urls
    .map((url, index) => ({
      fileType: types[index] ?? "external_link",
      label: labels[index] ?? "Link externo",
      url,
    }))
    .filter((item) => item.url.length > 0);
}

function normalizeExternalFileType(value: string) {
  const allowed = ["audio", "artwork", "video", "lyrics", "document", "external_link"];

  return allowed.includes(value) ? value : "external_link";
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function cleanText(value: string) {
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function canModifyExistingRelease(release: {
  status: string;
  submitted_at?: string | null;
  created_at: string;
}) {
  if (release.status === "draft" || release.status === "needs_changes") {
    return true;
  }

  if (release.status !== "submitted") {
    return false;
  }

  const submittedAt = new Date(release.submitted_at ?? release.created_at).getTime();
  return Date.now() - submittedAt < 24 * 60 * 60 * 1000;
}
