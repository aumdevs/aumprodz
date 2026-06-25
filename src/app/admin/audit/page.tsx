import { LockKeyhole } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminLogsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requirePermission("audit_logs.read", "/admin/audit");
  const { auditLogs, webhookLogs, errors } = await getAdminLogsData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Seguridad"
        title="Historial de cambios"
        description="Registro de acciones importantes, cambios sensibles y actividad automática del sistema."
      />

      <AdminDataAlert errors={errors} />

      <Card>
        <CardHeader>
          <LockKeyhole className="size-5 text-primary" />
          <CardTitle>Acciones sensibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Acción</th>
                  <th className="py-3 pr-4">Entidad</th>
                  <th className="py-3 pr-4">Resultado</th>
                  <th className="py-3 pr-4">Actor</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{log.action}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {log.entity_type ?? "-"} / {log.entity_id ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={log.outcome === "success" ? "default" : "danger"}>
                        {log.outcome}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {log.actor_id ?? "system"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
                      Todavía no hay acciones auditadas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos avisos automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Sistema</th>
                  <th className="py-3 pr-4">Aviso</th>
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
                    <td className="py-6 text-muted-foreground" colSpan={5}>
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
