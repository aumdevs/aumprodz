import { AlertTriangle, CheckCircle2, Clock3, LifeBuoy } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminTicketsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { updateTicketAction } from "./actions";

export const dynamic = "force-dynamic";
type BadgeTone = "default" | "accent" | "muted" | "danger";

export default async function AdminTicketsPage() {
  await requirePermission("tickets.manage", "/admin/tickets");
  const { tickets, errors } = await getAdminTicketsData();
  const openTickets = tickets.filter((ticket) =>
    ["new", "open", "pending"].includes(ticket.status),
  );
  const urgentTickets = tickets.filter((ticket) => ticket.priority === "urgent");
  const resolvedTickets = tickets.filter((ticket) =>
    ["resolved", "closed"].includes(ticket.status),
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Soporte"
        title="Casos de soporte"
        description="Solicitudes y conversaciones que necesitan seguimiento humano."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Casos nuevos, abiertos o pendientes."
          icon={Clock3}
          label="Abiertos"
          value={String(openTickets.length)}
        />
        <AdminStatCard
          detail="Casos marcados como urgentes."
          icon={AlertTriangle}
          label="Urgentes"
          value={String(urgentTickets.length)}
        />
        <AdminStatCard
          detail="Casos resueltos o cerrados."
          icon={CheckCircle2}
          label="Resueltos"
          value={String(resolvedTickets.length)}
        />
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <LifeBuoy className="mb-3 size-5 text-primary" />
                  <CardTitle>{ticket.subject ?? "Caso de soporte"}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {ticket.sendpulse_contacts?.name ??
                      ticket.sendpulse_contacts?.phone ??
                      ticket.sendpulse_contacts?.email ??
                      "Contacto sin identificar"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={getTicketStatusTone(ticket.status)}>
                    {getTicketStatusLabel(ticket.status)}
                  </Badge>
                  <Badge tone={getTicketPriorityTone(ticket.priority)}>
                    {getTicketPriorityLabel(ticket.priority)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-4">
                <p>
                  Teléfono:{" "}
                  <span className="font-medium text-foreground">
                    {ticket.sendpulse_contacts?.phone ?? "-"}
                  </span>
                </p>
                <p>
                  Email:{" "}
                  <span className="font-medium text-foreground">
                    {ticket.sendpulse_contacts?.email ?? "-"}
                  </span>
                </p>
                <p>
                  Última actividad:{" "}
                  <span className="font-medium text-foreground">
                    {ticket.latest_message_at
                      ? formatDateTime(ticket.latest_message_at)
                      : "-"}
                  </span>
                </p>
                <p>
                  Actualizado:{" "}
                  <span className="font-medium text-foreground">
                    {formatDateTime(ticket.updated_at)}
                  </span>
                </p>
              </div>

              {ticket.latest_message_body ? (
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Mensaje recibido
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                    {ticket.latest_message_body}
                  </p>
                </div>
              ) : null}

              <form
                action={updateTicketAction}
                className="grid gap-3 rounded-md border border-border bg-muted p-4 md:grid-cols-[180px_180px_auto]"
              >
                <input type="hidden" name="ticket_id" value={ticket.id} />
                <select
                  name="status"
                  defaultValue={ticket.status}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                >
                  {ticketStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getTicketStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <select
                  name="priority"
                  defaultValue={ticket.priority}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                >
                  {ticketPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {getTicketPriorityLabel(priority)}
                    </option>
                  ))}
                </select>
                <Button type="submit">Actualizar</Button>
              </form>
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Todavía no hay casos de soporte. Aparecerán cuando entren
              mensajes o señales de atención humana.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

const ticketStatuses = ["new", "open", "pending", "resolved", "closed"];
const ticketPriorities = ["low", "normal", "high", "urgent"];

function getTicketStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: "Nuevo",
    open: "Abierto",
    pending: "Pendiente",
    resolved: "Resuelto",
    closed: "Cerrado",
  };

  return labels[status] ?? status;
}

function getTicketPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority] ?? priority;
}

function getTicketStatusTone(status: string): BadgeTone {
  if (status === "closed" || status === "resolved") {
    return "muted";
  }

  if (status === "new" || status === "open") {
    return "default";
  }

  return "accent";
}

function getTicketPriorityTone(priority: string): BadgeTone {
  if (priority === "urgent" || priority === "high") {
    return "danger";
  }

  if (priority === "low") {
    return "muted";
  }

  return "default";
}
