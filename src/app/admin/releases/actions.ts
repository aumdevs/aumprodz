"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { normalizeReleaseStatus } from "@/lib/artist-releases";
import { requirePermission } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function updateReleaseStatusAction(formData: FormData) {
  const { user } = await requirePermission("releases.manage", "/admin/releases");
  const supabase = createServiceSupabaseClient();
  const releaseId = String(formData.get("release_id") ?? "");
  const nextStatus = normalizeReleaseStatus(formData.get("status"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!supabase || !releaseId) {
    redirect("/admin/releases?status=error");
  }

  const { data: before } = await supabase
    .from("releases")
    .select("*")
    .eq("id", releaseId)
    .maybeSingle();

  if (!before) {
    redirect("/admin/releases?status=not_found");
  }

  const update = {
    status: nextStatus,
  };

  const { error } = await supabase
    .from("releases")
    .update(update)
    .eq("id", releaseId);

  if (!error && before.status !== nextStatus) {
    await supabase.from("release_status_history").insert({
      release_id: releaseId,
      changed_by: user.id,
      from_status: before.status,
      to_status: nextStatus,
      notes: notes || "Cambio de estado desde admin",
    });
  }

  await createAuditLog({
    actorId: user.id,
    action: "releases.status_update",
    entityType: "releases",
    entityId: releaseId,
    outcome: error ? "failure" : "success",
    before,
    after: update,
    metadata: {
      notes,
      source: "admin_releases",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/releases");
  revalidatePath(`/artist/releases/${releaseId}`);
  redirect(error ? "/admin/releases?status=error" : "/admin/releases?status=saved");
}
