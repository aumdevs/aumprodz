"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function createArtistReportEntryAction(formData: FormData) {
  const { user } = await requirePermission(
    "artist_reports.manage",
    "/admin/artist-reports",
  );
  const supabase = createServiceSupabaseClient();
  const artistProfileId = clean(formData.get("artist_profile_id"));
  const releaseId = clean(formData.get("release_id"));
  const periodTitle = clean(formData.get("period_title")) ?? "Reporte manual";
  const periodStart = clean(formData.get("period_start"));
  const periodEnd = clean(formData.get("period_end"));
  const platform = clean(formData.get("platform"));
  const country = clean(formData.get("country"));
  const songTitle = clean(formData.get("song_title"));
  const streams = toNonNegativeNumber(formData.get("streams"));
  const views = toNonNegativeNumber(formData.get("views"));
  const revenueAmount = toMoneyNumber(formData.get("revenue_amount"));
  const currency = (clean(formData.get("currency")) ?? "USD").toUpperCase();
  const notes = clean(formData.get("notes"));

  if (!supabase || !artistProfileId || !periodStart || !periodEnd || !platform) {
    redirect("/admin/artist-reports?status=missing");
  }

  const { data: artistProfile } = await supabase
    .from("artist_profiles")
    .select("id,user_id,artist_name,legal_name")
    .eq("id", artistProfileId)
    .maybeSingle();

  if (!artistProfile?.user_id) {
    redirect("/admin/artist-reports?status=artist-not-found");
  }

  const { data: period, error: periodError } = await supabase
    .from("artist_report_periods")
    .insert({
      title: periodTitle,
      period_start: periodStart,
      period_end: periodEnd,
      source: "manual",
      uploaded_by: user.id,
      notes,
    })
    .select("id")
    .single();

  if (periodError || !period?.id) {
    await createAuditLog({
      actorId: user.id,
      action: "artist_reports.period_create",
      entityType: "artist_report_periods",
      outcome: "failure",
      after: { periodTitle, periodStart, periodEnd },
      metadata: { source: "admin_artist_reports", error: periodError?.message },
    });
    redirect("/admin/artist-reports?status=error");
  }

  const entryPayload = {
    period_id: period.id,
    user_id: artistProfile.user_id,
    artist_profile_id: artistProfileId,
    release_id: releaseId,
    song_title: songTitle,
    platform,
    country,
    streams,
    views,
    revenue_amount: revenueAmount,
    currency,
    notes,
  };
  const { data: entry, error: entryError } = await supabase
    .from("artist_report_entries")
    .insert(entryPayload)
    .select("id")
    .single();

  await createAuditLog({
    actorId: user.id,
    action: "artist_reports.entry_create",
    entityType: "artist_report_entries",
    entityId: entry?.id,
    outcome: entryError ? "failure" : "success",
    after: entryPayload,
    metadata: {
      source: "admin_artist_reports",
      artistName: artistProfile.artist_name ?? artistProfile.legal_name,
      error: entryError?.message,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/artist-reports");
  revalidatePath("/admin/reports");
  revalidatePath("/artist");
  redirect(entryError ? "/admin/artist-reports?status=error" : "/admin/artist-reports?status=saved");
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function toNonNegativeNumber(value: FormDataEntryValue | null) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function toMoneyNumber(value: FormDataEntryValue | null) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100) / 100) : 0;
}
