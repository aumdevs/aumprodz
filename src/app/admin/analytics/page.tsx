import { Activity, BarChart3, Globe2 } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalyticsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requirePermission("analytics.read", "/admin/analytics");
  const { events, eventBreakdown, serviceBreakdown, errors } =
    await getAdminAnalyticsData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Estadísticas"
        title="Actividad de la web"
        description="Visitas, servicios consultados y clics de personas interesadas antes de pasar a pago o WhatsApp."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Eventos públicos cargados para lectura."
          icon={Activity}
          label="Eventos"
          value={formatNumber(events.length)}
        />
        <AdminStatCard
          detail="Tipos distintos de actividad."
          icon={BarChart3}
          label="Tipos de evento"
          value={formatNumber(eventBreakdown.length)}
        />
        <AdminStatCard
          detail="Servicios con actividad registrada."
          icon={Globe2}
          label="Servicios medidos"
          value={formatNumber(serviceBreakdown.length)}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BreakdownCard
          empty="Los eventos aparecerán cuando la web reciba tráfico."
          items={eventBreakdown}
          title="Actividad por tipo"
        />
        <BreakdownCard
          empty="Los servicios aparecerán cuando se registren eventos asociados."
          items={serviceBreakdown}
          title="Actividad por servicio"
        />
      </div>

      <Card>
        <CardHeader>
          <Activity className="size-5 text-primary" />
          <CardTitle>Últimos eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Evento</th>
                  <th className="py-3 pr-4">Servicio</th>
                  <th className="py-3 pr-4">Página</th>
                  <th className="py-3 pr-4">Origen</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">
                      {formatAnalyticsLabel(event.event_name)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatAnalyticsLabel(event.service_slug)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {event.page_path ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {event.source ?? "directo"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(event.created_at)}
                    </td>
                  </tr>
                ))}
                {events.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
                      Todavía no hay eventos públicos registrados.
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

function BreakdownCard({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; count: number }[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-md border border-border bg-background p-3 text-sm"
          >
            <span>{formatAnalyticsLabel(item.label)}</span>
            <Badge>{formatNumber(item.count)}</Badge>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">{empty}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatAnalyticsLabel(value?: string | null) {
  if (!value || value === "sin-servicio") {
    return "Sin servicio";
  }

  return value.replace(/[_-]/g, " ");
}
