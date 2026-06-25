import { Clock3, FileUp, Music2, UploadCloud } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminReleaseFilesPanel } from "@/components/admin/admin-release-files-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReleaseFileTypeLabel } from "@/lib/artist-files";
import {
  getReleaseStatusLabel,
  getReleaseStatusTone,
  getReleaseTypeBadgeLabel,
  getReleaseTypeLabel,
  releaseStatuses,
} from "@/lib/artist-releases";
import { getAdminReleasesData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { updateReleaseStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  const { permissions } = await requirePermission("releases.manage", "/admin/releases");
  const { releases, payments, files, errors } = await getAdminReleasesData();
  const canDownloadFiles = permissions.includes("artist_files.download");
  const canPreviewFiles = permissions.includes("artist_files.listen");
  const uploadedReleaseIds = new Set(files.map((file) => file.release_id));
  const pendingReviewCount = releases.filter((release) =>
    ["draft", "submitted", "under_review"].includes(release.status),
  ).length;
  const videoFileCount = files.filter(
    (file) => file.status === "uploaded" && file.file_type === "video",
  ).length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Música enviada"
        title="Lanzamientos recibidos"
        description="Canciones, videos, portadas y datos enviados por artistas para revisar."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminStatCard
          detail="Lanzamientos visibles para operación."
          icon={Music2}
          label="Lanzamientos"
          value={String(releases.length)}
        />
        <AdminStatCard
          detail="En preparación, recibidos o bajo revisión."
          icon={Clock3}
          label="Por revisar"
          value={String(pendingReviewCount)}
        />
        <AdminStatCard
          detail="Lanzamientos con archivos cargados."
          icon={FileUp}
          label="Con archivos"
          value={String(uploadedReleaseIds.size)}
        />
        <AdminStatCard
          detail="Videos disponibles para vista previa."
          icon={UploadCloud}
          label="Videos"
          value={String(videoFileCount)}
        />
      </div>

      <div className="grid gap-4">
        {releases.map((release) => {
          const linkedPayments = payments.filter(
            (payment) => payment.release_id === release.id,
          );
          const linkedFiles = files.filter((file) => file.release_id === release.id);
          const uploadedFiles = linkedFiles.filter((file) => file.status === "uploaded");

          return (
            <Card key={release.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Music2 className="mb-3 size-5 text-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{release.title}</CardTitle>
                      <Badge tone="muted">
                        {getReleaseTypeBadgeLabel(release.release_type)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {getReleaseTypeLabel(release.release_type)} por{" "}
                      {release.artist_profiles?.artist_name ??
                        release.primary_artist}
                    </p>
                  </div>
                  <Badge tone={getReleaseStatusTone(release.status)}>
                    {getReleaseStatusLabel(release.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-4">
                  <p>
                    Email:{" "}
                    <span className="font-medium text-foreground">
                      {release.profiles?.email ?? "-"}
                    </span>
                  </p>
                  <p>
                    Fecha deseada:{" "}
                    <span className="font-medium text-foreground">
                      {release.desired_release_date ?? "-"}
                    </span>
                  </p>
                  <p>
                    Creado:{" "}
                    <span className="font-medium text-foreground">
                      {formatDateTime(release.created_at)}
                    </span>
                  </p>
                  <p>
                    Archivos:{" "}
                    <span className="font-medium text-foreground">
                      {uploadedFiles.length > 0
                        ? uploadedFiles
                            .map((file) => getReleaseFileTypeLabel(file.file_type))
                            .join(", ")
                        : "sin archivos subidos"}
                    </span>
                  </p>
                  <p>
                    Pagos:{" "}
                    <span className="font-medium text-foreground">
                      {linkedPayments.length > 0
                        ? linkedPayments
                            .map((payment) => payment.product_key)
                            .join(", ")
                        : "sin pago único asociado"}
                    </span>
                  </p>
                </div>

                {release.external_files_url ? (
                  <a
                    href={release.external_files_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary"
                  >
                    Abrir link externo de archivos
                  </a>
                ) : null}

                <AdminReleaseFilesPanel
                  canDownloadFiles={canDownloadFiles}
                  canPreviewFiles={canPreviewFiles}
                  files={linkedFiles}
                />

                <form
                  action={updateReleaseStatusAction}
                  className="grid gap-3 rounded-md border border-border bg-muted p-4 md:grid-cols-[220px_1fr_auto]"
                >
                  <input type="hidden" name="release_id" value={release.id} />
                  <select
                    name="status"
                    defaultValue={release.status}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  >
                    {releaseStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getReleaseStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <input
                    name="notes"
                    placeholder="Nota interna"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  />
                  <Button type="submit">Actualizar</Button>
                </form>
              </CardContent>
            </Card>
          );
        })}

        {releases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Todavía no hay lanzamientos enviados ni archivos cargados.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
