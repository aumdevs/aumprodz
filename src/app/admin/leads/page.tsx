import { MessageCircle, MousePointerClick, TrendingUp, Users } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminLeadsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requirePermission("leads.manage", "/admin/leads");
  const { clicks, leadScores, serviceBreakdown, errors } = await getAdminLeadsData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Contactos"
        title="Personas interesadas"
        description="Personas que hicieron clic para hablar por WhatsApp, con el servicio y la página de donde llegaron."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Clics registrados hacia WhatsApp."
          icon={MousePointerClick}
          label="Clics totales"
          value={formatNumber(clicks.length)}
        />
        <AdminStatCard
          detail="Servicios con intención medida."
          icon={MessageCircle}
          label="Servicios con interés"
          value={formatNumber(serviceBreakdown.length)}
        />
        <AdminStatCard
          detail="Contactos con puntaje calculado."
          icon={Users}
          label="Puntaje de contactos"
          value={formatNumber(leadScores.length)}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Últimos clics registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
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
                  {clicks.map((click) => (
                    <tr key={click.id} className="border-b border-border/70">
                      <td className="py-3 pr-4 font-medium">
                        {formatLeadLabel(click.service_slug ?? click.service_category)}
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
                  {clicks.length === 0 ? (
                    <tr>
                      <td className="py-6 text-muted-foreground" colSpan={5}>
                        Todavía no hay personas interesadas registradas.
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
            <MousePointerClick className="size-5 text-primary" />
            <CardTitle>Intención por servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-md border border-border bg-background p-3 text-sm"
              >
                <span>{formatLeadLabel(item.label)}</span>
                <Badge>{formatNumber(item.count)}</Badge>
              </div>
            ))}
            {serviceBreakdown.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                La intención por servicio aparecerá cuando haya clics.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <TrendingUp className="size-5 text-primary" />
          <CardTitle>Puntaje de contactos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Contacto</th>
                  <th className="py-3 pr-4">Puntaje</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Última señal</th>
                  <th className="py-3 pr-4">Señales</th>
                  <th className="py-3">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {leadScores.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {lead.sendpulse_contacts?.name ??
                          lead.sendpulse_contacts?.phone ??
                          lead.sendpulse_contacts?.email ??
                          "Contacto sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[
                          lead.sendpulse_contacts?.phone,
                          lead.sendpulse_contacts?.email,
                        ]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {formatNumber(lead.score)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone="muted">{lead.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {lead.last_signal ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatNumber(lead.signal_count)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {lead.last_activity_at
                        ? formatDateTime(lead.last_activity_at)
                        : "-"}
                    </td>
                  </tr>
                ))}
                {leadScores.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={6}>
                      Todavía no hay puntaje real de contactos.
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

function formatLeadLabel(value?: string | null) {
  if (!value || value === "sin-servicio") {
    return "Sin servicio";
  }

  return value.replace(/-/g, " ");
}
