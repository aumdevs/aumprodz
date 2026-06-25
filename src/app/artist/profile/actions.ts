"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { requireArtist } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function updateArtistProfileAction(formData: FormData) {
  const { user } = await requireArtist();
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    redirect("/artist/profile?status=configuration");
  }

  const update = {
    user_id: user.id,
    legal_name: clean(formData.get("legal_name")),
    artist_name: clean(formData.get("artist_name")),
    country: clean(formData.get("country")),
    phone: buildPhone(formData),
    bio: clean(formData.get("bio")),
    genre: clean(formData.get("genre")),
  };

  if (!update.legal_name || !update.artist_name) {
    redirect("/artist/profile?status=missing");
  }

  const { data: before } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("artist_profiles").upsert(update, {
    onConflict: "user_id",
  });

  await createAuditLog({
    actorId: user.id,
    action: "artist_profiles.update",
    entityType: "artist_profiles",
    entityId: before?.id ?? user.id,
    outcome: error ? "failure" : "success",
    before,
    after: update,
    metadata: {
      source: "artist_profile",
    },
  });

  revalidatePath("/artist");
  revalidatePath("/artist/profile");
  redirect(error ? "/artist/profile?status=error" : "/artist/profile?status=saved");
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function buildPhone(formData: FormData) {
  const code = String(formData.get("phone_country_code") ?? "+509").trim();
  const number = String(formData.get("phone_number") ?? "")
    .replace(/[^\d\s().-]/g, "")
    .trim();

  if (!number) {
    return null;
  }

  return `${code || "+509"} ${number}`;
}
