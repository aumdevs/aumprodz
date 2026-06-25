import { BadgeCheck, FileSignature, Music2 } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminArtistsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  await requirePermission("artists.read", "/admin/artists");
  const { artists, errors } = await getAdminArtistsData();
  const verifiedIdentityCount = artists.filter(
    (artist) => artist.identity_status === "verified",
  ).length;
  const signedContractCount = artists.filter((artist) =>
    ["signed", "completed"].includes(artist.contract_status),
  ).length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Artistas"
        title="Cuentas de artistas"
        description="Perfiles de artistas, estado de cuenta, identidad y contrato."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Perfiles de artista registrados."
          icon={Music2}
          label="Artistas"
          value={String(artists.length)}
        />
        <AdminStatCard
          detail="Identidad verificada por proveedor o admin."
          icon={BadgeCheck}
          label="Identidad verificada"
          value={String(verifiedIdentityCount)}
        />
        <AdminStatCard
          detail="Contratos firmados o completados."
          icon={FileSignature}
          label="Contrato firmado"
          value={String(signedContractCount)}
        />
      </div>

      <Card>
        <CardHeader>
          <Music2 className="size-5 text-primary" />
          <CardTitle>Artistas registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Artista</th>
                  <th className="py-3 pr-4">Contacto</th>
                  <th className="py-3 pr-4">Cuenta</th>
                  <th className="py-3 pr-4">Identidad</th>
                  <th className="py-3 pr-4">Contrato</th>
                  <th className="py-3">Creado</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {artist.artist_name ?? artist.legal_name ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {artist.legal_name ?? "Nombre legal pendiente"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <p>{artist.profiles?.email ?? "-"}</p>
                      <p>{artist.country ?? "-"} {artist.phone ?? ""}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={artist.status === "verified_artist" ? "default" : "muted"}>
                        {artist.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {artist.identity_status}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {artist.contract_status}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(artist.created_at)}
                    </td>
                  </tr>
                ))}
                {artists.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={6}>
                      Todavía no hay artistas registrados.
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
