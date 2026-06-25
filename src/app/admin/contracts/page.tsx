import { ExternalLink, FileSignature, Send, UploadCloud } from "lucide-react";

import {
  sendContractToSignNowAction,
  uploadContractPdfAction,
} from "@/app/admin/contracts/actions";
import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminLegalData } from "@/lib/admin/data";
import {
  getContractStatusLabel,
  getLegalStatusTone,
} from "@/lib/legal";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  saved: "Estado legal actualizado.",
  uploaded: "Contrato PDF subido.",
  sent: "Contrato enviado a signNow.",
  error: "No se pudo actualizar el estado legal.",
  upload_error: "No se pudo subir el contrato PDF.",
  send_error: "No se pudo enviar el contrato a signNow.",
  not_found: "No se encontró el artista.",
};

export default async function AdminContractsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const statusParam = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const statusMessage =
    typeof statusParam === "string" ? statusMessages[statusParam] : null;
  const { permissions } = await requirePermission("contracts.read", "/admin/contracts");
  const canUploadContracts = permissions.includes("contracts.upload");
  const canSendContracts = permissions.includes("contracts.send");
  const { artists, contracts, errors } = await getAdminLegalData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Documentos legales"
        title="Contratos de artistas"
        description="Sube contratos, revisa firmas y confirma que cada artista tenga sus documentos en orden."
      />

      <AdminDataAlert errors={errors} />

      {statusMessage ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {statusMessage}
        </div>
      ) : null}

      {canUploadContracts ? (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <UploadCloud className="mb-3 size-5 text-primary" />
              <CardTitle>Subir contrato PDF</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Carga el contrato oficial para un artista y déjalo listo para
                enviarlo a signNow.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            action={uploadContractPdfAction}
            className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)_auto]"
          >
            <select
              name="artist_profile_id"
              required
              disabled={artists.length === 0}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60"
              defaultValue=""
            >
              <option value="" disabled>
                Seleccionar artista
              </option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.artist_name ??
                    artist.legal_name ??
                    artist.profiles?.email ??
                    "Artista sin nombre"}
                </option>
              ))}
            </select>
            <input
              name="title"
              defaultValue="Contrato oficial AUM PRODZ"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
            <input
              type="file"
              name="contract_file"
              accept="application/pdf"
              required
              disabled={artists.length === 0}
              className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
            />
            <Button type="submit" disabled={artists.length === 0}>
              <UploadCloud className="size-4" />
              Subir PDF
            </Button>
          </form>
        </CardContent>
      </Card>
      ) : null}

      <Card>
        <CardHeader>
          <FileSignature className="size-5 text-primary" />
          <CardTitle>Contratos cargados y firmados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Lista operativa de contratos por artista: código interno, firmante,
            archivo, fechas, estado y acción de firma.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Contrato</th>
                  <th className="py-3 pr-4">Código artista</th>
                  <th className="py-3 pr-4">Firmante</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Archivo</th>
                  <th className="py-3 pr-4">Fechas</th>
                  <th className="py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{contract.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {contract.provider} / {getContractProviderDocumentId(contract)}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="block max-w-[220px] break-all rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {formatContractCode(
                          contract.artist_profile_id ?? contract.user_id,
                        )}
                      </code>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <p>{getContractSignerName(contract) ?? "Firmante pendiente"}</p>
                      <p className="text-xs">
                        {getContractSignerEmail(contract) ?? "sin email"}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={getLegalStatusTone(contract.status)}>
                        {getContractStatusLabel(contract.status)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {getContractOriginalFilename(contract) ??
                        contract.document_reference ??
                        "-"}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      <p>Cargado: {formatDateTime(contract.created_at)}</p>
                      <p>
                        Firmado:{" "}
                        {getContractSignedAt(contract)
                          ? formatDateTime(getContractSignedAt(contract))
                          : "-"}
                      </p>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {canSendContracts && contract.status === "draft" ? (
                          <form action={sendContractToSignNowAction}>
                            <input
                              type="hidden"
                              name="contract_id"
                              value={contract.id}
                            />
                            <Button size="sm" type="submit">
                              <Send className="size-3.5" />
                              Enviar a firmar
                            </Button>
                          </form>
                        ) : null}
                        {contract.signing_url &&
                        !["signed", "completed"].includes(contract.status) ? (
                          <a
                            href={contract.signing_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted"
                          >
                            Link firma
                            <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                        {contract.signed_document_url ? (
                          <a
                            href={contract.signed_document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted"
                          >
                            Documento firmado
                            <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {contracts.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={7}>
                      Todavía no hay contratos PDF cargados.
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

function getContractProviderDocumentId(contract: {
  provider_document_id?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return (
    contract.provider_document_id ??
    getMetadataString(contract.metadata, "provider_document_id") ??
    "-"
  );
}

function getContractSignerEmail(contract: {
  signer_email?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return contract.signer_email ?? getMetadataString(contract.metadata, "signer_email");
}

function getContractSignerName(contract: {
  signer_name?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return contract.signer_name ?? getMetadataString(contract.metadata, "signer_name");
}

function getContractOriginalFilename(contract: {
  original_filename?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return (
    contract.original_filename ??
    getMetadataString(contract.metadata, "original_filename")
  );
}

function getMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value : null;
}

function getContractSignedAt(contract: {
  status: string;
  signed_at: string | null;
  completed_at: string | null;
  updated_at: string;
}) {
  if (!["signed", "completed"].includes(contract.status)) {
    return null;
  }

  return contract.completed_at ?? contract.signed_at ?? contract.updated_at;
}

function formatContractCode(value: string) {
  return value.length > 18 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}
