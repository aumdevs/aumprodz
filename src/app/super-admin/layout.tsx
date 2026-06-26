import type React from "react";

import { AdminShellClient } from "@/components/admin/admin-shell-client";
import { adminNav } from "@/components/admin/admin-shell";
import type { AdminNavItem } from "@/components/admin/admin-sidebar-nav";
import {
  getAdminNavBadgeCounts,
  markAdminNavSectionSeen,
} from "@/lib/admin/data";
import { getRequestPathname } from "@/lib/i18n/server";
import { requireSuperAdmin } from "@/lib/permissions";

const superAdminNav: AdminNavItem[] = [
  {
    href: "/super-admin",
    label: "Centro de control",
    icon: "shield",
    permissions: [],
  },
  ...adminNav,
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { roles, user } = await requireSuperAdmin();
  const pathname = await getRequestPathname();
  await markAdminNavSectionSeen(pathname);
  const badgeCounts = await getAdminNavBadgeCounts();

  return (
    <AdminShellClient
      initialBadgeCounts={badgeCounts}
      items={superAdminNav}
      mode="super"
      roles={roles}
      userEmail={user.email}
    >
      {children}
    </AdminShellClient>
  );
}
