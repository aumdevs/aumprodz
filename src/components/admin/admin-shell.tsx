import Link from "next/link";
import {
  BarChart3,
  Bot,
  BotMessageSquare,
  CreditCard,
  Download,
  FileSignature,
  FolderOpen,
  Gauge,
  KanbanSquare,
  LifeBuoy,
  LockKeyhole,
  Music2,
  PlayCircle,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  Webhook,
} from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import {
  getAdminNavBadgeCounts,
  markAdminNavSectionSeen,
} from "@/lib/admin/data";
import { getRequestPathname } from "@/lib/i18n/server";
import { getUserPermissionKeys, requireAdmin } from "@/lib/permissions";

const adminNav = [
  { href: "/admin", label: "Inicio del panel", icon: Gauge, permissions: [] },
  { href: "/admin/services", label: "Servicios publicados", icon: BarChart3, permissions: ["content.manage"] },
  { href: "/admin/youtube", label: "Videos publicados", icon: PlayCircle, permissions: ["content.manage"] },
  { href: "/admin/leads", label: "Personas interesadas", icon: Users, permissions: ["leads.manage"] },
  { href: "/admin/analytics", label: "Estadísticas", icon: BarChart3, permissions: ["analytics.read"] },
  { href: "/admin/sendpulse", label: "Mensajes de WhatsApp", icon: Bot, permissions: ["sendpulse.read"] },
  { href: "/admin/bot-quality", label: "Calidad del asistente", icon: BotMessageSquare, permissions: ["sendpulse.read"] },
  { href: "/admin/tickets", label: "Casos de soporte", icon: LifeBuoy, permissions: ["tickets.manage"] },
  { href: "/admin/kanban", label: "Trabajo por estado", icon: KanbanSquare, permissions: ["operations.kanban"] },
  { href: "/admin/reports", label: "Reportes", icon: Download, permissions: ["analytics.read"] },
  { href: "/admin/alerts", label: "Pendientes importantes", icon: TriangleAlert, permissions: ["alerts.read"] },
  { href: "/admin/artists", label: "Cuentas de artistas", icon: Music2, permissions: ["artists.read"] },
  { href: "/admin/verifications", label: "Verificaciones de identidad", icon: ShieldCheck, permissions: ["identity.read_status"] },
  { href: "/admin/releases", label: "Música enviada", icon: Music2, permissions: ["releases.manage"] },
  { href: "/admin/files", label: "Archivos de artistas", icon: FolderOpen, permissions: ["artist_files.listen", "artist_files.download", "artist_files.modify"] },
  { href: "/admin/payments", label: "Pagos y suscripciones", icon: CreditCard, permissions: ["payments.read"] },
  { href: "/admin/contracts", label: "Contratos de artistas", icon: FileSignature, permissions: ["contracts.read"] },
  { href: "/admin/artist-reports", label: "Reportes artísticos", icon: BarChart3, permissions: ["artist_reports.manage"] },
  { href: "/admin/webhooks", label: "Conexiones automáticas", icon: Webhook, permissions: ["webhooks.read"] },
  { href: "/admin/roles", label: "Equipo y permisos", icon: ShieldCheck, permissions: ["admins.create", "roles.manage"] },
  { href: "/admin/settings", label: "Ajustes del sistema", icon: Settings, permissions: ["settings.manage"] },
  { href: "/admin/audit", label: "Historial de cambios", icon: LockKeyhole, permissions: ["audit_logs.read"] },
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
        <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-8 pr-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const badgeCount = badgeCounts[item.href] ?? 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {badgeCount > 0 ? (
                  <span
                    aria-label={`${formatBadgeCount(badgeCount)} pendientes`}
                    className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-black leading-none text-destructive-foreground ring-2 ring-card"
                    title={`${badgeCount} elementos`}
                  >
                    {formatBadgeCount(badgeCount)}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
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

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}
