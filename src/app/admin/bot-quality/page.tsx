import { BotMessageSquare, TriangleAlert } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSendPulseData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBotQualityPage() {
  await requirePermission("sendpulse.read", "/admin/bot-quality");
  const { botFailures, messages, errors } = await getAdminSendPulseData();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="WhatsApp"
        title="Calidad del asistente"
        description="Errores, respuestas fallidas y casos donde el asistente necesita revisión humana."
      />
      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminStatCard
          detail="Fallos registrados por el bot."
          icon={TriangleAlert}
          label="Fallos"
          value={String(botFailures.length)}
        />
        <AdminStatCard
          detail="Mensajes recientes disponibles para revisión."
          icon={BotMessageSquare}
          label="Mensajes"
          value={String(messages.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <TriangleAlert className="size-5 text-primary" />
          <CardTitle>Fallos del asistente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Motivo</th>
                  <th className="py-3 pr-4">Canal</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Mensaje</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {botFailures.map((failure) => (
                  <tr key={failure.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">
                      {failure.failure_type}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {failure.sendpulse_contacts?.phone ??
                        failure.sendpulse_contacts?.email ??
                        failure.provider_event_id ??
                        "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone="danger">Revisar</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {failure.reason ?? "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(failure.created_at)}
                    </td>
                  </tr>
                ))}
                {botFailures.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
                      No hay fallos del asistente registrados todavía.
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
