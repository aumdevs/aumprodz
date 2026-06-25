"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/permissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateServiceAction(formData: FormData) {
  const { user } = await requirePermission("content.manage", "/admin/services");
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "");

  if (!supabase || !id) {
    redirect("/admin/services?status=error");
  }

  const update = {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    price_from: String(formData.get("price_from") ?? "").trim(),
    duration: String(formData.get("duration") ?? "").trim(),
    whatsapp_message: String(formData.get("whatsapp_message") ?? "").trim(),
    is_active: formData.get("is_active") === "on",
  };

  if (
    !update.title ||
    !update.summary ||
    !update.price_from ||
    !update.whatsapp_message
  ) {
    redirect("/admin/services?status=missing");
  }

  const { data: before } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("services").update(update).eq("id", id);

  await createAuditLog({
    actorId: user.id,
    action: "services.update",
    entityType: "services",
    entityId: id,
    outcome: error ? "failure" : "success",
    before,
    after: update,
    metadata: {
      source: "admin_services",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath("/servicios");
  redirect(error ? "/admin/services?status=error" : "/admin/services?status=saved");
}

export async function updateServiceTranslationAction(formData: FormData) {
  const { user } = await requirePermission("service_catalog.manage", "/admin/services");
  const supabase = await createServerSupabaseClient();
  const entityId = clean(formData.get("entity_id"));
  const entityType = clean(formData.get("entity_type"));
  const locale = clean(formData.get("locale"));
  const fieldName = clean(formData.get("field_name"));
  const value = String(formData.get("value") ?? "").trim();

  if (!supabase || !entityId || !entityType || !locale || !fieldName) {
    redirect("/admin/services?status=error");
  }

  const { error } = await supabase.from("content_translations").upsert(
    {
      entity_id: entityId,
      entity_type: entityType,
      locale,
      field_name: fieldName,
      value,
    },
    { onConflict: "entity_type,entity_id,locale,field_name" },
  );

  await createAuditLog({
    actorId: user.id,
    action: "services.translation_update",
    entityType: "content_translations",
    entityId: `${entityType}:${entityId}:${locale}:${fieldName}`,
    outcome: error ? "failure" : "success",
    after: { entityId, entityType, locale, fieldName, value },
    metadata: { source: "admin_services" },
  });

  revalidateServicePaths();
  redirect(error ? "/admin/services?status=translation-error" : "/admin/services?status=translation-saved");
}

export async function upsertServicePackageAction(formData: FormData) {
  const { user } = await requirePermission("service_catalog.manage", "/admin/services");
  const supabase = await createServerSupabaseClient();
  const id = clean(formData.get("id"));
  const serviceId = clean(formData.get("service_id"));
  const payload = {
    service_id: serviceId,
    title: clean(formData.get("title")) ?? "",
    description: clean(formData.get("description")),
    price_label: clean(formData.get("price_label")),
    duration: clean(formData.get("duration")),
    features: clean(formData.get("features"))
      ?.split(/\n/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [],
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  if (!supabase || !serviceId || !payload.title) {
    redirect("/admin/services?status=missing");
  }

  const query = id
    ? supabase.from("service_packages").update(payload).eq("id", id)
    : supabase.from("service_packages").insert(payload);
  const { error } = await query;

  await auditServiceCmsChange({
    actorId: user.id,
    action: id ? "service_packages.update" : "service_packages.create",
    entityType: "service_packages",
    entityId: id ?? serviceId,
    outcome: error ? "failure" : "success",
    after: payload,
  });

  revalidateServicePaths();
  redirect(error ? "/admin/services?status=cms-error" : "/admin/services?status=cms-saved");
}

export async function upsertServiceFaqAction(formData: FormData) {
  const { user } = await requirePermission("service_catalog.manage", "/admin/services");
  const supabase = await createServerSupabaseClient();
  const id = clean(formData.get("id"));
  const serviceId = clean(formData.get("service_id"));
  const payload = {
    service_id: serviceId,
    question: clean(formData.get("question")) ?? "",
    answer: clean(formData.get("answer")) ?? "",
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  if (!supabase || !serviceId || !payload.question || !payload.answer) {
    redirect("/admin/services?status=missing");
  }

  const query = id
    ? supabase.from("service_faqs").update(payload).eq("id", id)
    : supabase.from("service_faqs").insert(payload);
  const { error } = await query;

  await auditServiceCmsChange({
    actorId: user.id,
    action: id ? "service_faqs.update" : "service_faqs.create",
    entityType: "service_faqs",
    entityId: id ?? serviceId,
    outcome: error ? "failure" : "success",
    after: payload,
  });

  revalidateServicePaths();
  redirect(error ? "/admin/services?status=cms-error" : "/admin/services?status=cms-saved");
}

export async function upsertServiceCtaAction(formData: FormData) {
  const { user } = await requirePermission("service_catalog.manage", "/admin/services");
  const supabase = await createServerSupabaseClient();
  const id = clean(formData.get("id"));
  const serviceId = clean(formData.get("service_id"));
  const payload = {
    service_id: serviceId,
    label: clean(formData.get("label")) ?? "",
    placement: clean(formData.get("placement")) ?? "default",
    whatsapp_message: clean(formData.get("whatsapp_message")),
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  if (!supabase || !serviceId || !payload.label) {
    redirect("/admin/services?status=missing");
  }

  const query = id
    ? supabase.from("service_ctas").update(payload).eq("id", id)
    : supabase.from("service_ctas").insert(payload);
  const { error } = await query;

  await auditServiceCmsChange({
    actorId: user.id,
    action: id ? "service_ctas.update" : "service_ctas.create",
    entityType: "service_ctas",
    entityId: id ?? serviceId,
    outcome: error ? "failure" : "success",
    after: payload,
  });

  revalidateServicePaths();
  redirect(error ? "/admin/services?status=cms-error" : "/admin/services?status=cms-saved");
}

export async function upsertServiceMediaAction(formData: FormData) {
  const { user } = await requirePermission("service_catalog.manage", "/admin/services");
  const supabase = await createServerSupabaseClient();
  const id = clean(formData.get("id"));
  const serviceId = clean(formData.get("service_id"));
  const payload = {
    service_id: serviceId,
    media_type: clean(formData.get("media_type")) ?? "image",
    title: clean(formData.get("title")),
    url: clean(formData.get("url")),
    alt_text: clean(formData.get("alt_text")),
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  if (!supabase || !serviceId || !payload.url) {
    redirect("/admin/services?status=missing");
  }

  const query = id
    ? supabase.from("service_media").update(payload).eq("id", id)
    : supabase.from("service_media").insert(payload);
  const { error } = await query;

  await auditServiceCmsChange({
    actorId: user.id,
    action: id ? "service_media.update" : "service_media.create",
    entityType: "service_media",
    entityId: id ?? serviceId,
    outcome: error ? "failure" : "success",
    after: payload,
  });

  revalidateServicePaths();
  redirect(error ? "/admin/services?status=cms-error" : "/admin/services?status=cms-saved");
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function revalidateServicePaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath("/servicios");
}

async function auditServiceCmsChange(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  outcome: "success" | "failure";
  after: unknown;
}) {
  await createAuditLog({
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? undefined,
    outcome: input.outcome,
    after: input.after,
    metadata: { source: "admin_services" },
  });
}
