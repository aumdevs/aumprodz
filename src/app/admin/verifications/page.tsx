import { ExternalLink, ShieldCheck } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminVerificationsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  await requirePermission("identity.read_status", "/admin/verifications");
  const { artists, identityVerifications, errors } = await getAdminVerificationsData();
  const verifiedArtists = artists.filter(
    (artist) => artist.identity_status === "verified",
  );
  const pendingArtists = artists.filter(
    (artist) => artist.identity_status !== "verified",
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Identidad"
        title="Verificaciones de identidad"
        description="Estado Didit y registros manuales de verificación por artista."
      />
      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Artistas con perfil registrado."
          icon={ShieldCheck}
          label="Artistas"
          value={String(artists.length)}
        />
        <AdminStatCard
          detail="Identidad verificada."
          icon={ShieldCheck}
          label="Verificados"
          value={String(verifiedArtists.length)}
        />
        <AdminStatCard
          detail="Pendientes de validación."
          icon={ShieldCheck}
          label="Pendientes"
          value={String(pendingArtists.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>Registros de verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Artista</th>
                  <th className="py-3 pr-4">Proveedor</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Código externo</th>
                  <th className="py-3 pr-4">Link</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {identityVerifications.map((verification) => {
                  const artist = artists.find(
                    (item) => item.id === verification.artist_profile_id,
                  );

                  return (
                    <tr key={verification.id} className="border-b border-border/70">
                      <td className="py-3 pr-4">
                        <p className="font-medium">
                          {artist?.artist_name ?? artist?.legal_name ?? artist?.profiles?.email ?? verification.user_id}
                        </p>
                        <code className="text-xs text-muted-foreground">
                          {verification.user_id}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {verification.provider}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={verification.status === "verified" ? "default" : "muted"}>
                          {verification.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {verification.provider_verification_id ?? "-"}
                      </td>
                      <td className="py-3 pr-4">
                        {verification.verification_url ? (
                          <a
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                            href={verification.verification_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Abrir
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDateTime(verification.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {identityVerifications.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={6}>
                      Todavía no hay registros de verificación.
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
