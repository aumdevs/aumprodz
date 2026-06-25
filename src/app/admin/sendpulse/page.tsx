import { Bot, MessageCircle, UserRound, Workflow, type LucideIcon } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSendPulseData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSendPulsePage() {
  await requirePermission("sendpulse.read", "/admin/sendpulse");
  const { contacts, conversations, messages, botFailures, webhookLogs, errors } =
    await getAdminSendPulseData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="WhatsApp"
        title="Mensajes de WhatsApp"
        description="Contactos, conversaciones, mensajes y casos que necesitan atención del equipo."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={UserRound} label="Contactos" value={contacts.length} />
        <MetricCard
          icon={Workflow}
          label="Conversaciones"
          value={conversations.length}
        />
        <MetricCard icon={MessageCircle} label="Mensajes" value={messages.length} />
        <MetricCard icon={Bot} label="Errores del asistente" value={botFailures.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <UserRound className="size-5 text-primary" />
            <CardTitle>Contactos reales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4">Contacto</th>
                    <th className="py-3 pr-4">Canal</th>
                    <th className="py-3 pr-4">Estado</th>
                    <th className="py-3 pr-4">Código externo</th>
                    <th className="py-3">Última actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border/70">
                      <td className="py-3 pr-4">
                        <p className="font-medium">
                          {contact.name ??
                            contact.phone ??
                            contact.email ??
                            "Contacto sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[contact.phone, contact.email].filter(Boolean).join(" / ") ||
                            "-"}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {contact.channel}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone="muted">{contact.lead_status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {contact.provider_contact_id ?? "-"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDateTime(contact.last_seen_at)}
                      </td>
                    </tr>
                  ))}
                  {contacts.length === 0 ? (
                    <tr>
                      <td className="py-6 text-muted-foreground" colSpan={5}>
                        Todavía no hay contactos reales desde WhatsApp.
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
            <Workflow className="size-5 text-primary" />
            <CardTitle>Conversaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="rounded-md border border-border bg-background p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {conversation.sendpulse_contacts?.name ??
                      conversation.sendpulse_contacts?.phone ??
                      conversation.sendpulse_contacts?.email ??
                      "Sin contacto"}
                  </p>
                  <Badge tone={conversation.status === "open" ? "default" : "muted"}>
                    {conversation.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {conversation.provider_conversation_id ?? conversation.id}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {conversation.last_message_at
                    ? formatDateTime(conversation.last_message_at)
                    : "Sin mensajes todavía"}
                </p>
              </div>
            ))}
            {conversations.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Las conversaciones aparecerán cuando entren mensajes reales.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <MessageCircle className="size-5 text-primary" />
            <CardTitle>Últimos mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4">Contacto</th>
                    <th className="py-3 pr-4">Dirección</th>
                    <th className="py-3 pr-4">Mensaje</th>
                    <th className="py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className="border-b border-border/70">
                      <td className="py-3 pr-4 font-medium">
                        {message.sendpulse_contacts?.name ??
                          message.sendpulse_contacts?.phone ??
                          message.sendpulse_contacts?.email ??
                          "-"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          tone={
                            message.direction === "system"
                              ? "muted"
                              : message.direction === "inbound"
                                ? "default"
                                : "accent"
                          }
                        >
                          {message.direction}
                        </Badge>
                      </td>
                      <td className="max-w-[360px] py-3 pr-4 text-muted-foreground">
                        {message.body ?? `[${message.message_type}]`}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDateTime(message.occurred_at)}
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 ? (
                    <tr>
                      <td className="py-6 text-muted-foreground" colSpan={4}>
                        Todavía no hay mensajes normalizados.
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
            <Bot className="size-5 text-primary" />
            <CardTitle>Calidad del asistente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {botFailures.map((failure) => (
              <div
                key={failure.id}
                className="rounded-md border border-border bg-background p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{failure.failure_type}</p>
                  <Badge tone="danger">Revisar</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {failure.reason ?? "Sin razón detallada"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(failure.created_at)}
                </p>
              </div>
            ))}
            {botFailures.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                No hay errores del asistente registrados.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Bot className="size-5 text-primary" />
          <CardTitle>Avisos recibidos de WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Evento</th>
                  <th className="py-3 pr-4">Código externo</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{log.event_type}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {log.provider_event_id ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={log.status === "failed" ? "danger" : "muted"}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
                {webhookLogs.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={4}>
                      Todavía no hay avisos de WhatsApp recibidos.
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

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatNumber(value)}</p>
      </CardContent>
    </Card>
  );
}
