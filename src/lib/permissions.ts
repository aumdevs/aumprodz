import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import {
  isUsableArtistAnnualSubscription,
  pickBestArtistAnnualSubscription,
} from "@/lib/artist-billing";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/utils";

export type AppRole =
  | "super_admin"
  | "support"
  | "artist_manager"
  | "content_editor"
  | "finance"
  | "analyst"
  | "artist";

const adminRoles: AppRole[] = [
  "super_admin",
  "support",
  "artist_manager",
  "content_editor",
  "finance",
  "analyst",
];

type RoleJoin = {
  roles: { key?: string } | { key?: string }[] | null;
};

type PermissionKeyJoin = {
  permissions: { key?: string } | { key?: string }[] | null;
};

type PermissionOverrideJoin = {
  is_allowed: boolean;
  permissions: { key?: string } | { key?: string }[] | null;
};

export async function requireUser(nextPath = "/") {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(`/login?reason=configuration&next=${encodeURIComponent(nextPath)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?reason=auth&next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}

export async function requireAdmin() {
  const { user } = await requireUser("/admin");
  const roles = await getUserRoleKeys(user.id);
  const allowed = roles.some((role) => adminRoles.includes(role as AppRole));

  if (!allowed) {
    redirect("/login?reason=forbidden&next=/admin");
  }

  return { user, roles };
}

export async function requireSuperAdmin(nextPath = "/super-admin") {
  const { user } = await requireUser(nextPath);
  const roles = await getUserRoleKeys(user.id);

  if (!roles.includes("super_admin")) {
    redirect(`/login?reason=forbidden&next=${encodeURIComponent(nextPath)}`);
  }

  return { user, roles };
}

export async function requirePermission(permissionKey: string, nextPath = "/admin") {
  const { user, roles } = await requireAdmin();
  const permissions = await getUserPermissionKeys(user.id);

  if (!permissions.includes(permissionKey)) {
    redirect(`/login?reason=forbidden&next=${encodeURIComponent(nextPath)}`);
  }

  return { user, roles, permissions };
}

export async function requireAnyPermission(
  permissionKeys: string[],
  nextPath = "/admin",
) {
  const { user, roles } = await requireAdmin();
  const permissions = await getUserPermissionKeys(user.id);

  if (!permissionKeys.some((permissionKey) => permissions.includes(permissionKey))) {
    redirect(`/login?reason=forbidden&next=${encodeURIComponent(nextPath)}`);
  }

  return { user, roles, permissions };
}

export async function requireArtist() {
  const { supabase, user } = await requireUser("/artist");
  const roles = await getUserRoleKeys(user.id);

  if (roles.includes("artist")) {
    return { supabase, user, roles };
  }

  const [{ data: profile }, { data: artistProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,user_type,status")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("artist_profiles")
      .select("id,user_id,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (profile?.user_type !== "artist" && !artistProfile) {
    redirect("/login?reason=forbidden&next=/artist");
  }

  return { supabase, user, roles };
}

export async function requirePaidArtist(nextPath = "/artist") {
  const context = await requireArtist();
  const { data: subscriptions } = await context.supabase
    .from("artist_subscriptions")
    .select("status,current_period_start,current_period_end,created_at")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const subscription = pickBestArtistAnnualSubscription(subscriptions);

  if (!isUsableArtistAnnualSubscription(subscription)) {
    const billingUrl = new URL("http://localhost/artist/billing");
    billingUrl.searchParams.set("checkout", "payment_required");
    billingUrl.searchParams.set("next", nextPath);

    redirect(`${billingUrl.pathname}${billingUrl.search}`);
  }

  return context;
}

export async function getUserRoleKeys(userId: User["id"]) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(key)")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return (data as RoleJoin[])
    .map((row) => {
      if (Array.isArray(row.roles)) {
        return row.roles[0]?.key;
      }

      return row.roles?.key;
    })
    .filter((role): role is string => Boolean(role));
}

export async function getUserPermissionKeys(userId: User["id"]) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: userRoles, error: userRolesError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  if (userRolesError || !userRoles) {
    return [];
  }

  const roleIds = userRoles.map((role) => role.role_id).filter(Boolean);

  if (roleIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("role_permissions")
    .select("permissions(key)")
    .in("role_id", roleIds);

  if (error || !data) {
    return [];
  }

  const permissionSet = new Set(
    (data as PermissionKeyJoin[])
    .map((row) => {
      const permissions = row.permissions;

      if (Array.isArray(permissions)) {
        return permissions[0]?.key;
      }

      return permissions?.key;
    })
    .filter((permission): permission is string => Boolean(permission)),
  );

  const { data: overrides } = await supabase
    .from("user_permission_overrides")
    .select("is_allowed,permissions(key)")
    .eq("user_id", userId);

  for (const override of (overrides ?? []) as PermissionOverrideJoin[]) {
    const permissions = override.permissions;
    const permission = Array.isArray(permissions)
      ? permissions[0]?.key
      : permissions?.key;

    if (!permission) {
      continue;
    }

    if (override.is_allowed) {
      permissionSet.add(permission);
    } else {
      permissionSet.delete(permission);
    }
  }

  return [...permissionSet];
}

export function getSafeNextFromSearchParam(value?: string | string[]) {
  const next = Array.isArray(value) ? value[0] : value;
  return sanitizeNextPath(next ?? "/");
}
