import {
  Activity,
  Bot,
  ChartNoAxesColumnIncreasing,
  Globe2,
  MousePointerClick,
  Settings,
  Music2,
  Users,
  Webhook,
} from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminMetricsChart } from "@/components/admin/admin-metrics-chart";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardData } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/permissions";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const metricIcons = [
  Users,
  MousePointerClick,
  Settings,
  Music2,
  Bot,
];

export default async function AdminDashboardPage() {
  const { roles } = await requireAdmin();
  const dashboard = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Panel principal"
        title="Vista general"
        description="Resumen de lo que está pasando: visitas, contactos, servicios, artistas, pagos y tareas recientes."
      >
        <div className="text-right">
          <Badge tone="accent">Roles: {roles.join(", ") || "admin"}</Badge>
          <p className="mt-2 text-xs text-muted-foreground">
            Datos protegidos por permisos internos.
          </p>
        </div>
      </AdminPageHeader>

      <AdminDataAlert errors={dashboard.errors} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dashboard.metrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? Activity;
          return (
            <AdminStatCard
              key={metric.label}
              detail={metric.detail}
              icon={Icon}
              label={metric.label}
              value={formatNumber(metric.value)}
            />
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Visitas y clics a WhatsApp por día</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMetricsChart data={dashboard.dailyFunnel} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lectura rápida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickSignal
              icon={<Globe2 className="size-4 text-primary" />}
              label="Actividad reciente"
              value={dashboard.latestEvents.length}
              detail="Últimos movimientos registrados en la web."
            />
            <QuickSignal
              icon={<MousePointerClick className="size-4 text-primary" />}
              label="Clics recientes"
              value={dashboard.latestCtaClicks.length}
              detail="Últimos clics de intención a WhatsApp."
            />
            <QuickSignal
              icon={<Webhook className="size-4 text-primary" />}
              label="Avisos automáticos pendientes"
              value={dashboard.metrics[4]?.value ?? 0}
              detail="Avisos recibidos o fallidos por revisar."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Últimos clics WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4">Servicio</th>
                    <th className="py-3 pr-4">Origen</th>
                    <th className="py-3 pr-4">Página</th>
                    <th className="py-3 pr-4">País</th>
                    <th className="py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.latestCtaClicks.map((click) => (
                    <tr key={click.id} className="border-b border-border/70">
                      <td className="py-3 pr-4 font-medium">
                        {click.service_slug ?? "sin-servicio"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {click.source ?? "directo"} / {click.placement ?? "cta"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {click.page_path ?? "-"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {click.country ?? "-"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDateTime(click.created_at)}
                      </td>
                    </tr>
                  ))}
                  {dashboard.latestCtaClicks.length === 0 ? (
                    <tr>
                      <td className="py-6 text-muted-foreground" colSpan={5}>
                        Todavía no hay clics registrados.
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
            <ChartNoAxesColumnIncreasing className="size-5 text-primary" />
            <CardTitle>Servicios con más intención</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.serviceBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-md border border-border bg-background p-3 text-sm"
              >
                <span className="font-medium">{item.label}</span>
                <Badge>{formatNumber(item.count)}</Badge>
              </div>
            ))}
            {dashboard.serviceBreakdown.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                La distribución por servicio aparecerá cuando entren clics.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Activity className="size-5 text-primary" />
          <CardTitle>Últimos eventos públicos</CardTitle>
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
                {dashboard.latestEvents.map((event) => (
                  <tr key={event.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{event.event_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {event.service_slug ?? "sin servicio"}
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
                {dashboard.latestEvents.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
                      Todavía no hay eventos recientes.
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

function QuickSignal({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold">{label}</p>
        </div>
        <Badge>{formatNumber(value)}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}
