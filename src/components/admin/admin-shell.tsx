import type React from "react";

import { AdminShellClient } from "@/components/admin/admin-shell-client";
import type { AdminNavItem } from "@/components/admin/admin-sidebar-nav";
import {
  getAdminNavBadgeCounts,
  markAdminNavSectionSeen,
} from "@/lib/admin/data";
import { getRequestPathname } from "@/lib/i18n/server";
import { getUserPermissionKeys, requireAdmin } from "@/lib/permissions";

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Inicio del panel", icon: "gauge", permissions: [] },
  { href: "/admin/services", label: "Servicios publicados", icon: "barChart", permissions: ["content.manage"] },
  { href: "/admin/youtube", label: "Videos publicados", icon: "play", permissions: ["content.manage"] },
  { href: "/admin/leads", label: "Personas interesadas", icon: "users", permissions: ["leads.manage"] },
  { href: "/admin/analytics", label: "Estadísticas", icon: "barChart", permissions: ["analytics.read"] },
  { href: "/admin/sendpulse", label: "Mensajes de WhatsApp", icon: "bot", permissions: ["sendpulse.read"] },
  { href: "/admin/bot-quality", label: "Calidad del asistente", icon: "botQuality", permissions: ["sendpulse.read"] },
  { href: "/admin/tickets", label: "Casos de soporte", icon: "lifeBuoy", permissions: ["tickets.manage"] },
  { href: "/admin/kanban", label: "Trabajo por estado", icon: "kanban", permissions: ["operations.kanban"] },
  { href: "/admin/reports", label: "Reportes", icon: "download", permissions: ["analytics.read"] },
  { href: "/admin/alerts", label: "Pendientes importantes", icon: "alert", permissions: ["alerts.read"] },
  { href: "/admin/artists", label: "Cuentas de artistas", icon: "music", permissions: ["artists.read"] },
  { href: "/admin/verifications", label: "Verificaciones de identidad", icon: "shield", permissions: ["identity.read_status"] },
  { href: "/admin/releases", label: "Música enviada", icon: "music", permissions: ["releases.manage"] },
  { href: "/admin/files", label: "Archivos de artistas", icon: "folderOpen", permissions: ["artist_files.listen", "artist_files.download", "artist_files.modify"] },
  { href: "/admin/payments", label: "Pagos y suscripciones", icon: "creditCard", permissions: ["payments.read"] },
  { href: "/admin/contracts", label: "Contratos de artistas", icon: "fileSignature", permissions: ["contracts.read"] },
  { href: "/admin/artist-reports", label: "Reportes artísticos", icon: "barChart", permissions: ["artist_reports.manage"] },
  { href: "/admin/webhooks", label: "Conexiones automáticas", icon: "webhook", permissions: ["webhooks.read"] },
  { href: "/admin/roles", label: "Equipo y permisos", icon: "shield", permissions: ["admins.create", "roles.manage"] },
  { href: "/admin/settings", label: "Ajustes del sistema", icon: "settings", permissions: ["settings.manage"] },
  { href: "/admin/audit", label: "Historial de cambios", icon: "lock", permissions: ["audit_logs.read"] },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const { roles, user } = await requireAdmin();
  const pathname = await getRequestPathname();
  await markAdminNavSectionSeen(pathname);
  const badgeCounts = await getAdminNavBadgeCounts();
  const permissions = await getUserPermissionKeys(user.id);
  const canSeeEverything = roles.includes("super_admin");
  const visibleNav = adminNav.filter(
    (item) =>
      canSeeEverything ||
      item.permissions.length === 0 ||
      item.permissions.some((permission) => permissions.includes(permission)),
  );

  return (
    <AdminShellClient
      initialBadgeCounts={badgeCounts}
      items={visibleNav}
      roles={roles}
      userEmail={user.email}
    >
      {children}
    </AdminShellClient>
  );
}
