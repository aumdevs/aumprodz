import { CheckCircle2, ExternalLink, FileSignature, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getContractStatusLabel,
  getLegalStatusTone,
} from "@/lib/legal";
import { requirePaidArtist } from "@/lib/permissions";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ContractRecord = {
  id: string;
  provider: string;
  title: string;
  status: string;
  signing_url: string | null;
  signed_document_url: string | null;
  signed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
};

export default async function ArtistContractPage() {
  const { supabase, user } = await requirePaidArtist();
  const [{ data: profile }, { data: contracts }] = await Promise.all([
    supabase
      .from("artist_profiles")
      .select("legal_name,artist_name,contract_status,status,updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("artist_contracts")
      .select("id,provider,title,status,signing_url,signed_document_url,signed_at,completed_at,created_at,updated_at,metadata")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const currentStatus = profile?.contract_status ?? "not_started";
  const signed = currentStatus === "signed" || currentStatus === "completed";
  const contractRows = (contracts ?? []) as ContractRecord[];
  const signedContracts = contractRows.filter((contract) =>
      ["signed", "completed"].includes(contract.status),
  );
  const pendingContracts = contractRows.filter(
    (contract) =>
      !["signed", "completed", "cancelled", "expired"].includes(contract.status),
  );
  const contractToSign =
    pendingContracts.find((contract) => Boolean(contract.signing_url)) ??
    pendingContracts[0] ??
    null;
  const officialContract = signedContracts[0] ?? null;
  const signedContractItems =
    signedContracts.length > 0
      ? signedContracts
      : signed
        ? [
            {
              id: "profile-contract-status",
              provider: "manual",
              title: "Contrato oficial de la cuenta",
              status: currentStatus,
              signing_url: null,
              signed_document_url: null,
              signed_at: null,
              completed_at: null,
              created_at: profile?.updated_at ?? new Date().toISOString(),
              updated_at: profile?.updated_at ?? new Date().toISOString(),
              metadata: null,
            },
          ]
        : [];
  const signedAt =
    officialContract?.completed_at ??
    officialContract?.signed_at ??
    (signed ? officialContract?.updated_at ?? profile?.updated_at : null);
  const signedBy =
    profile?.legal_name ?? profile?.artist_name ?? user.email ?? "Artista";

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="accent">Contratos</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          Firma del contrato
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Revisa el contrato asignado por Aum Prodz y fírmalo desde el
          proveedor seguro de e-signature cuando esté disponible.
        </p>
      </div>

      <Card>
        <CardHeader>
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>Contrato oficial para firmar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-3">
            {signed ? (
              <span className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-100 px-4 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="size-4" />
                Contrato ya firmado
              </span>
            ) : (
              <Badge tone={getLegalStatusTone(currentStatus)}>
                Contrato aún no firmado
              </Badge>
            )}
          </div>

          {!signed && contractToSign?.signing_url ? (
            <div className="rounded-md border border-border bg-muted p-4">
              <p className="font-semibold text-foreground">
                {contractToSign.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Al presionar Firmar se abrirá el proveedor de firma. Cuando el
                proveedor confirme la firma, este panel mostrará el contrato
                como firmado.
              </p>
              <a
                href={contractToSign.signing_url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "mt-4 w-fit",
                )}
              >
                Firmar contrato
                <ExternalLink className="size-4" />
              </a>
            </div>
          ) : null}

          {!signed && contractToSign && !contractToSign.signing_url ? (
            <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              Tu contrato ya está cargado y está siendo preparado para firma.
            </div>
          ) : null}

          {!signed && !contractToSign ? (
            <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              Aún no hay contrato disponible para firma.
            </div>
          ) : null}

          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-md border border-border p-3">
              <p className="font-semibold text-foreground">Estado</p>
              <p>{getContractStatusLabel(currentStatus)}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="font-semibold text-foreground">Firmado por</p>
              <p>{signed ? signedBy : "-"}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="font-semibold text-foreground">Firmado desde</p>
              <p>{signedAt ? formatDateTime(signedAt) : "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <FileSignature className="size-5 text-primary" />
          <CardTitle>Contratos firmados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {signedContractItems.length > 0 ? (
            signedContractItems.map((contract) => (
              <SignedContractRow
                key={contract.id}
                contract={contract}
                signedBy={signedBy}
                fallbackSignedAt={signedAt}
              />
            ))
          ) : (
            <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              Aún no hay contratos firmados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SignedContractRow({
  contract,
  signedBy,
  fallbackSignedAt,
}: {
  contract: ContractRecord;
  signedBy: string;
  fallbackSignedAt?: string | null;
}) {
  const metadata = contract.metadata ?? {};
  const signer =
    getMetadataText(metadata, ["signer_name", "signed_by", "signer_email"]) ??
    signedBy;
  const signatureIp =
    getMetadataText(metadata, [
      "signature_ip_address",
      "signer_ip_address",
      "ip_address",
    ]) ?? "No registrado";
  const signatureDevice =
    getMetadataText(metadata, ["signature_device", "device"]) ??
    describeDevice(getMetadataText(metadata, ["signature_user_agent", "user_agent"])) ??
    "No registrado";
  const signedAt =
    contract.completed_at ??
    contract.signed_at ??
    fallbackSignedAt ??
    contract.updated_at;

  return (
    <div className="grid gap-4 rounded-md border border-border p-4 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">{contract.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {contract.provider} / firmado por el artista
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="size-3.5" />
          Firmado
        </span>
      </div>

      <div className="grid gap-3 text-muted-foreground md:grid-cols-4">
        <InfoItem label="Firmado por" value={signer} />
        <InfoItem label="Fecha de firma" value={formatDateTime(signedAt)} />
        <InfoItem label="IP de firma" value={signatureIp} />
        <InfoItem label="Computador / dispositivo" value={signatureDevice} />
      </div>

      {contract.signed_document_url ? (
        <a
          href={contract.signed_document_url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-fit")}
        >
          Ver documento
          <ExternalLink className="size-4" />
        </a>
      ) : null}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/60 p-3">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-1 break-words">{value}</p>
    </div>
  );
}

function getMetadataText(
  metadata: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function describeDevice(userAgent?: string | null) {
  if (!userAgent) {
    return null;
  }

  if (/macintosh|mac os x/i.test(userAgent)) {
    return "Mac";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/iphone|ipad|ios/i.test(userAgent)) {
    return "iPhone / iPad";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Dispositivo no identificado";
}
