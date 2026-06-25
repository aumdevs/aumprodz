import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAlertsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminAlertsPage() {
  await requirePermission("alerts.read", "/admin/alerts");
  const { alerts, errors } = await getAdminAlertsData();
  const criticalAlerts = alerts.filter((alert) => alert.tone === "danger");
  const pendingAlerts = alerts.filter((alert) => alert.tone !== "danger");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Operación"
        title="Pendientes importantes"
        description="Situaciones que necesitan revisión para que la operación no se quede detenida."
      />
      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Alertas abiertas en total."
          icon={AlertTriangle}
          label="Alertas"
          value={String(alerts.length)}
        />
        <AdminStatCard
          detail="Casos que conviene revisar primero."
          icon={Clock3}
          label="Críticas"
          value={String(criticalAlerts.length)}
        />
        <AdminStatCard
          detail="Pendientes no críticos."
          icon={CheckCircle2}
          label="Pendientes"
          value={String(pendingAlerts.length)}
        />
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-1 size-5 text-primary" />
                <div>
                  <div className="mb-2">
                    <Badge tone={alert.tone === "danger" ? "danger" : "default"}>
                      {alert.tone === "danger" ? "Crítica" : "Pendiente"}
                    </Badge>
                  </div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
              <Link
                href={alert.href}
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
              >
                Revisar
              </Link>
            </CardContent>
          </Card>
        ))}

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No hay alertas internas pendientes con los datos actuales.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
