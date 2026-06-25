import { AdminSidebarNav, type AdminNavItem } from "@/components/admin/admin-sidebar-nav";
import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import {
  getAdminNavBadgeCounts,
  markAdminNavSectionSeen,
} from "@/lib/admin/data";
import { getRequestPathname } from "@/lib/i18n/server";
import { getUserPermissionKeys, requireAdmin } from "@/lib/permissions";

const adminNav: AdminNavItem[] = [
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
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border bg-card p-5 lg:flex">
        <AumProdzLogo />
        <AdminSidebarNav
          items={visibleNav}
          initialBadgeCounts={badgeCounts}
        />
      </aside>
      <main className="lg:pl-72">
        <div className="border-b border-border bg-card/70 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <AumProdzLogo compact className="lg:hidden" />
            <div>
              <p className="text-sm font-semibold">AUM PRODZ Admin</p>
              <p className="text-xs text-muted-foreground">
                Administración, operación y seguimiento diario.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
