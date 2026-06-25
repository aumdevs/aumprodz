import { CheckCircle2, Clock3, TriangleAlert, Webhook } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminLogsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminWebhooksPage() {
  await requirePermission("webhooks.read", "/admin/webhooks");
  const { webhookLogs, errors } = await getAdminLogsData();
  const failedLogs = webhookLogs.filter((log) => log.status === "failed");
  const pendingLogs = webhookLogs.filter((log) => log.status === "received");
  const processedLogs = webhookLogs.filter((log) => log.status === "processed");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Integraciones"
        title="Conexiones automáticas"
        description="Avisos que llegan desde pagos, WhatsApp, identidad y firma digital."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Avisos procesados correctamente."
          icon={CheckCircle2}
          label="Procesados"
          value={String(processedLogs.length)}
        />
        <AdminStatCard
          detail="Avisos recibidos pendientes."
          icon={Clock3}
          label="Pendientes"
          value={String(pendingLogs.length)}
        />
        <AdminStatCard
          detail="Avisos con error."
          icon={TriangleAlert}
          label="Fallidos"
          value={String(failedLogs.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <Webhook className="size-5 text-primary" />
          <CardTitle>Avisos externos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Sistema</th>
                  <th className="py-3 pr-4">Aviso</th>
                  <th className="py-3 pr-4">Código externo</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Error</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{log.provider}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {log.event_type}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {log.provider_event_id ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={log.status === "failed" ? "danger" : "muted"}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {log.error_message ?? "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
                {webhookLogs.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={6}>
                      Todavía no hay avisos automáticos registrados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
