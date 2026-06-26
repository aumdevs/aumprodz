import { BadgeCheck, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePaidArtist } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { requestIdentityVerificationAction } from "./actions";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  requested: "Solicitud de verificación enviada.",
  returned: "Verificación recibida. El estado se actualizará cuando Didit envíe el resultado.",
  missing_didit: "Didit todavía no está configurado. Contacta al equipo AUM PRODZ.",
  error: "No se pudo crear la solicitud. Revisa Supabase o intenta de nuevo.",
};

type VerificationMetadata = {
  document_type?: string;
  documentType?: string;
};

export default async function ArtistVerificationPage({
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
  const { supabase, user } = await requirePaidArtist();
  const [{ data: profile }, { data: latestVerification }] = await Promise.all([
    supabase
      .from("artist_profiles")
      .select("identity_status,status,updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("identity_verifications")
      .select("provider,status,verified_at,updated_at,metadata")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const verified = profile?.identity_status === "verified";
  const metadata = (latestVerification?.metadata ?? {}) as VerificationMetadata;
  const documentType =
    metadata.document_type ??
    metadata.documentType ??
    (verified ? "Documento de identidad" : "Pendiente");
  const verifiedAt =
    latestVerification?.verified_at ??
    (latestVerification?.status === "verified"
      ? latestVerification.updated_at
      : verified
        ? profile?.updated_at
        : null);

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="accent">Verificación</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          Identidad
        </h1>
      </div>

      {statusMessage ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {statusMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <BadgeCheck className="size-5 text-primary" />
          <CardTitle>Estado de identidad</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-3">
            {verified ? (
              <span className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground">
                Verificación completada
              </span>
            ) : (
              <form action={requestIdentityVerificationAction}>
                <Button type="submit">Verificar identidad con Didit</Button>
              </form>
            )}
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-md border border-border p-3">
              <FileText className="mb-2 size-4 text-primary" />
              <p className="font-semibold text-foreground">Documento</p>
              <p>{documentType}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="font-semibold text-foreground">Proveedor</p>
              <p>{latestVerification?.provider ?? (verified ? "AUM PRODZ" : "-")}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="font-semibold text-foreground">Verificada desde</p>
              <p>{verifiedAt ? formatDateTime(verifiedAt) : "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
