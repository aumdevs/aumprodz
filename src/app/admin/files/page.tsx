import { FolderOpen } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminReleaseFilesPanel } from "@/components/admin/admin-release-files-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReleaseTypeLabel } from "@/lib/artist-releases";
import { getAdminReleasesData } from "@/lib/admin/data";
import { requireAnyPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminFilesPage() {
  const { permissions } = await requireAnyPermission(
    ["artist_files.listen", "artist_files.download", "artist_files.modify"],
    "/admin/files",
  );
  const { releases, files, errors } = await getAdminReleasesData();
  const canPreviewFiles = permissions.includes("artist_files.listen");
  const canDownloadFiles = permissions.includes("artist_files.download");
  const releasesWithFiles = releases.filter((release) =>
    files.some((file) => file.release_id === release.id),
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Archivos privados"
        title="Archivos de artistas"
        description="Audio, video, portadas, letras y documentos enviados por artistas."
      />
      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Archivos subidos y visibles para operación."
          icon={FolderOpen}
          label="Archivos"
          value={String(files.length)}
        />
        <AdminStatCard
          detail="Lanzamientos con archivos cargados."
          icon={FolderOpen}
          label="Lanzamientos"
          value={String(releasesWithFiles.length)}
        />
        <AdminStatCard
          detail="Archivos de video disponibles."
          icon={FolderOpen}
          label="Videos"
          value={String(files.filter((file) => file.file_type === "video").length)}
        />
      </div>

      <div className="grid gap-5">
        {releasesWithFiles.map((release) => (
          <Card key={release.id}>
            <CardHeader>
              <FolderOpen className="size-5 text-primary" />
              <CardTitle>{release.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getReleaseTypeLabel(release.release_type)} / {release.primary_artist}
              </p>
            </CardHeader>
            <CardContent>
              <AdminReleaseFilesPanel
                canDownloadFiles={canDownloadFiles}
                canPreviewFiles={canPreviewFiles}
                files={files.filter((file) => file.release_id === release.id)}
              />
            </CardContent>
          </Card>
        ))}
        {releasesWithFiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Todavía no hay archivos de artistas para revisar.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
