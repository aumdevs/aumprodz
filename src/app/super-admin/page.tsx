import {
  Activity,
  AlertTriangle,
  Database,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import {
  getAdminAlertsData,
  getAdminDashboardData,
  getAdminLogsData,
  getAdminRolesData,
  getAdminSetupStatus,
} from "@/lib/admin/data";
import { requireSuperAdmin } from "@/lib/permissions";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const { roles } = await requireSuperAdmin();
  const [dashboard, alerts, logs, rolesData] = await Promise.all([
    getAdminDashboardData(),
    getAdminAlertsData(),
    getAdminLogsData(),
    getAdminRolesData(),
  ]);
  const setup = getAdminSetupStatus();
  const configuredCount = setup.filter((item) => item.configured).length;
  const criticalAlerts = alerts.alerts.slice(0, 6);
  const latestAuditLogs = logs.auditLogs.slice(0, 6);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Super Admin"
        title="Centro de control de plataforma"
        description="Vista global para salud del sistema, permisos, integraciones, auditoría y operación completa de AUM PRODZ."
      >
        <Badge tone="accent">Rol activo: {roles.join(", ")}</Badge>
      </AdminPageHeader>

      <AdminDataAlert
        errors={[...dashboard.errors, ...alerts.errors, ...logs.errors, ...rolesData.errors]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="Variables e integraciones detectadas."
          icon={Database}
          label="Configuración lista"
          tone={configuredCount === setup.length ? "success" : "warning"}
          value={`${configuredCount}/${setup.length}`}
        />
        <StatCard
          detail="Roles registrados en Supabase."
          icon={ShieldCheck}
          label="Roles del sistema"
          tone="info"
          value={formatNumber(rolesData.roles.length)}
        />
        <StatCard
          detail="Usuarios con rol administrativo o artista."
          icon={Users}
          label="Usuarios con acceso"
          tone="default"
          value={formatNumber(rolesData.userRoles.length)}
        />
        <StatCard
          detail="Alertas reales que requieren revisión."
          icon={AlertTriangle}
          label="Alertas abiertas"
          tone={criticalAlerts.length > 0 ? "danger" : "success"}
          value={formatNumber(alerts.alerts.length)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Salud de integraciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {setup.map((item) => (
                <div
                  key={item.env}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/70 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.area} · {item.env}
                    </p>
                  </div>
                  <Badge tone={item.configured ? "success" : "danger"}>
                    {item.configured ? "Configurado" : "Falta"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <KeyRound className="size-5 text-primary" />
            <CardTitle>Permisos y roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickNumber label="Permisos" value={rolesData.permissions.length} />
              <QuickNumber label="Asignaciones" value={rolesData.rolePermissions.length} />
              <QuickNumber label="Roles de usuario" value={rolesData.userRoles.length} />
              <QuickNumber label="Permisos individuales" value={rolesData.userPermissionOverrides.length} />
            </div>
            <div className="space-y-2">
              {rolesData.roles.slice(0, 8).map((role) => (
                <div
                  key={role.id}
                  className="rounded-md border border-border bg-background/70 p-3"
                >
                  <p className="text-sm font-semibold">{role.name ?? role.key}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {role.description ?? "Rol sin descripción administrativa."}
                  </p>
                </div>
              ))}
              {rolesData.roles.length === 0 ? (
                <EmptyState
                  description="Cuando existan roles, aparecerán aquí para revisión global."
                  title="Sin roles configurados"
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <AlertTriangle className="size-5 text-warning" />
            <CardTitle>Alertas críticas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-md border border-border bg-background/70 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <Badge tone={alert.tone}>
                    {alert.tone === "danger" ? "Alta" : "Revisar"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {alert.detail}
                </p>
              </div>
            ))}
            {criticalAlerts.length === 0 ? (
              <EmptyState
                description="No hay alertas abiertas en este momento."
                title="Sistema sin alertas críticas"
              />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Activity className="size-5 text-primary" />
            <CardTitle>Auditoría reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestAuditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-md border border-border bg-background/70 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{log.action}</p>
                  <Badge tone={log.outcome === "success" ? "success" : "danger"}>
                    {log.outcome}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {log.entity_type ?? "sistema"} · {formatDateTime(log.created_at)}
                </p>
              </div>
            ))}
            {latestAuditLogs.length === 0 ? (
              <EmptyState
                description="Los cambios sensibles aparecerán aquí cuando existan registros."
                title="Sin eventos de auditoría"
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickNumber({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background/70 p-3">
      <p className="text-2xl font-black">{formatNumber(value)}</p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
