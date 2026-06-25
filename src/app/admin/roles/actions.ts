"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuditLog } from "@/lib/audit";
import { getEnv } from "@/lib/env";
import { requirePermission } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function assignRoleAction(formData: FormData) {
  const { user } = await requirePermission("admins.create", "/admin/roles");
  const serviceSupabase = createServiceSupabaseClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleKey = String(formData.get("role_key") ?? "").trim();

  if (!serviceSupabase) {
    redirect("/admin/roles?status=service-role-missing");
  }

  if (!email || !roleKey) {
    redirect("/admin/roles?status=missing");
  }

  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("id,email")
    .eq("email", email)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/admin/roles?status=user-not-found");
  }

  const result = await assignRoleToUser({
    actorId: user.id,
    userId: profile.id,
    roleKey,
  });

  await createAuditLog({
    actorId: user.id,
    action: "admins.assign_role",
    entityType: "user_roles",
    entityId: profile.id,
    outcome: result.ok ? "success" : "failure",
    after: {
      email,
      role: roleKey,
    },
    metadata: {
      source: "admin_roles",
    },
  });

  revalidatePath("/admin/roles");
  redirect(result.ok ? "/admin/roles?status=role-saved" : "/admin/roles?status=error");
}

export async function createAdminUserAction(formData: FormData) {
  const { user } = await requirePermission("admins.create", "/admin/roles");
  const serviceSupabase = createServiceSupabaseClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const roleKey = String(formData.get("role_key") ?? "").trim();
  const temporaryPassword = String(formData.get("temporary_password") ?? "");
  const shouldSendInvite = formData.get("send_invite") === "on";

  if (!serviceSupabase) {
    redirect("/admin/roles?status=service-role-missing");
  }

  if (!email || !fullName || !roleKey) {
    redirect("/admin/roles?status=missing");
  }

  if (!shouldSendInvite && temporaryPassword.length < 8) {
    redirect("/admin/roles?status=password-short");
  }

  const redirectTo = `${getEnv("NEXT_PUBLIC_APP_BASE_URL") ?? getEnv("APP_BASE_URL") ?? "http://localhost:3000"}/login?next=%2Fadmin`;
  const created = shouldSendInvite
    ? await serviceSupabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          user_type: "admin",
        },
        redirectTo,
      })
    : await serviceSupabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          user_type: "admin",
        },
      });

  if (created.error || !created.data.user) {
    await createAuditLog({
      actorId: user.id,
      action: "admins.create_user",
      entityType: "profiles",
      entityId: email,
      outcome: "failure",
      metadata: {
        source: "admin_roles",
        email,
        error: created.error?.message,
      },
    });

    redirect("/admin/roles?status=create-error");
  }

  const createdUserId = created.data.user.id;
  await serviceSupabase.from("profiles").upsert(
    {
      id: createdUserId,
      email,
      full_name: fullName,
      user_type: "admin",
      status: "active",
    },
    { onConflict: "id" },
  );

  const roleResult = await assignRoleToUser({
    actorId: user.id,
    userId: createdUserId,
    roleKey,
  });

  await createAuditLog({
    actorId: user.id,
    action: "admins.create_user",
    entityType: "profiles",
    entityId: createdUserId,
    outcome: roleResult.ok ? "success" : "failure",
    after: {
      email,
      full_name: fullName,
      role: roleKey,
      invited: shouldSendInvite,
    },
    metadata: {
      source: "admin_roles",
    },
  });

  revalidatePath("/admin/roles");
  redirect(
    roleResult.ok
      ? shouldSendInvite
        ? "/admin/roles?status=user-invited"
        : "/admin/roles?status=user-created"
      : "/admin/roles?status=error",
  );
}

export async function updateUserPermissionOverrideAction(formData: FormData) {
  const { user } = await requirePermission("roles.manage", "/admin/roles");
  const serviceSupabase = createServiceSupabaseClient();
  const userId = String(formData.get("user_id") ?? "").trim();
  const permissionId = String(formData.get("permission_id") ?? "").trim();
  const roleIncluded = formData.get("role_included") === "true";
  const enabled = formData.get("enabled") === "true";

  if (!serviceSupabase) {
    redirect("/admin/roles?status=service-role-missing");
  }

  if (!userId || !permissionId) {
    redirect("/admin/roles?status=missing");
  }

  const { error } =
    enabled === roleIncluded
      ? await serviceSupabase
          .from("user_permission_overrides")
          .delete()
          .eq("user_id", userId)
          .eq("permission_id", permissionId)
      : await serviceSupabase.from("user_permission_overrides").upsert(
          {
            user_id: userId,
            permission_id: permissionId,
            is_allowed: enabled,
            assigned_by: user.id,
          },
          { onConflict: "user_id,permission_id" },
        );

  await createAuditLog({
    actorId: user.id,
    action: "admins.update_user_permission",
    entityType: "user_permission_overrides",
    entityId: `${userId}:${permissionId}`,
    outcome: error ? "failure" : "success",
    after: {
      user_id: userId,
      permission_id: permissionId,
      enabled,
      role_included: roleIncluded,
    },
    metadata: {
      source: "admin_roles",
    },
  });

  revalidatePath("/admin/roles");
  redirect(error ? "/admin/roles?status=permission-error" : "/admin/roles?status=permission-saved");
}

async function assignRoleToUser({
  actorId,
  userId,
  roleKey,
}: {
  actorId: string;
  userId: string;
  roleKey: string;
}) {
  const serviceSupabase = createServiceSupabaseClient();

  if (!serviceSupabase) {
    return { ok: false };
  }

  const { data: role, error: roleError } = await serviceSupabase
    .from("roles")
    .select("id,key")
    .eq("key", roleKey)
    .maybeSingle();

  if (roleError || !role) {
    return { ok: false };
  }

  const { error } = await serviceSupabase.from("user_roles").upsert(
    {
      user_id: userId,
      role_id: role.id,
      assigned_by: actorId,
    },
    {
      ignoreDuplicates: true,
      onConflict: "user_id,role_id",
    },
  );

  return { ok: !error };
}
