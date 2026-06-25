import { updateContractStatusAction } from "@/app/admin/contracts/actions";
import { updateReleaseStatusAction } from "@/app/admin/releases/actions";
import { updateTicketAction } from "@/app/admin/tickets/actions";
import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  getReleaseStatusLabel,
  getReleaseTypeLabel,
  releaseStatuses,
} from "@/lib/artist-releases";
import { getAdminKanbanData } from "@/lib/admin/data";
import { contractStatuses, getContractStatusLabel, getLegalStatusTone } from "@/lib/legal";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ticketStatuses = ["new", "open", "pending", "resolved", "closed"];
const activeReleaseStatuses = releaseStatuses.filter(
  (status) => status !== "draft" && status !== "cancelled" && status !== "rejected",
);
const activeContractStatuses = contractStatuses.filter(
  (status) => status !== "not_started" && status !== "cancelled" && status !== "expired",
);

export default async function AdminKanbanPage() {
  await requirePermission("operations.kanban", "/admin/kanban");
  const { releases, tickets, contracts, errors } = await getAdminKanbanData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Operación"
        title="Trabajo por estado"
        description="Lanzamientos, soporte y contratos organizados según el punto en que están."
      />
      <AdminDataAlert errors={errors} />

      <KanbanSection title="Lanzamientos">
        {activeReleaseStatuses.map((status) => (
          <KanbanColumn key={status} title={getReleaseStatusLabel(status)}>
            {releases
              .filter((release) => release.status === status)
              .map((release) => (
                <Card key={release.id}>
                  <CardContent className="grid gap-3 p-4 text-sm">
                    <div>
                      <p className="font-semibold">{release.title}</p>
                      <p className="text-muted-foreground">
                        {getReleaseTypeLabel(release.release_type)} /{" "}
                        {release.primary_artist}
                      </p>
                    </div>
                    <form action={updateReleaseStatusAction} className="grid gap-2">
                      <input type="hidden" name="release_id" value={release.id} />
                      <select
                        name="status"
                        defaultValue={release.status}
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        {activeReleaseStatuses.map((item) => (
                          <option key={item} value={item}>
                            {getReleaseStatusLabel(item)}
                          </option>
                        ))}
                      </select>
                      <input
                        name="notes"
                        placeholder="Nota"
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      />
                      <Button size="sm" type="submit">
                        Mover
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
          </KanbanColumn>
        ))}
      </KanbanSection>

      <KanbanSection title="Casos de soporte">
        {ticketStatuses.map((status) => (
          <KanbanColumn key={status} title={status}>
            {tickets
              .filter((ticket) => ticket.status === status)
              .map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="grid gap-3 p-4 text-sm">
                    <div>
                      <p className="font-semibold">{ticket.subject ?? "Ticket"}</p>
                      <p className="text-muted-foreground">
                        {ticket.sendpulse_contacts?.email ??
                          ticket.sendpulse_contacts?.phone ??
                          "Contacto sin dato"}
                      </p>
                    </div>
                    <form action={updateTicketAction} className="grid gap-2">
                      <input type="hidden" name="ticket_id" value={ticket.id} />
                      <select
                        name="status"
                        defaultValue={ticket.status}
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        {ticketStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <select
                        name="priority"
                        defaultValue={ticket.priority}
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        {["low", "normal", "high", "urgent"].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" type="submit">
                        Actualizar
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
          </KanbanColumn>
        ))}
      </KanbanSection>

      <KanbanSection title="Contratos">
        {activeContractStatuses.map((status) => (
          <KanbanColumn key={status} title={getContractStatusLabel(status)}>
            {contracts
              .filter((contract) => contract.status === status)
              .map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="grid gap-3 p-4 text-sm">
                    <div>
                      <div className="mb-2">
                        <Badge tone={getLegalStatusTone(contract.status)}>
                          {getContractStatusLabel(contract.status)}
                        </Badge>
                      </div>
                      <p className="font-semibold">{contract.title}</p>
                      <p className="text-muted-foreground">
                        {contract.signer_email ?? contract.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(contract.updated_at)}
                      </p>
                    </div>
                    <form action={updateContractStatusAction} className="grid gap-2">
                      <input type="hidden" name="contract_id" value={contract.id} />
                      <select
                        name="status"
                        defaultValue={contract.status}
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        {activeContractStatuses.map((item) => (
                          <option key={item} value={item}>
                            {getContractStatusLabel(item)}
                          </option>
                        ))}
                      </select>
                      <input
                        name="notes"
                        placeholder="Nota"
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      />
                      <Button size="sm" type="submit">
                        Actualizar
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
          </KanbanColumn>
        ))}
      </KanbanSection>
    </div>
  );
}

function KanbanSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black tracking-normal">{title}</h2>
      <div className="grid gap-4 overflow-x-auto lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </div>
    </section>
  );
}

function KanbanColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const count = Array.isArray(children) ? children.filter(Boolean).length : 0;

  return (
    <div className="min-h-60 rounded-md border border-border bg-muted p-3">
      <div className="mb-3 flex items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Badge tone="muted">{count}</Badge>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
