import Link from "next/link";
import { ArrowRight, Music2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatFileSize,
  getReleaseFileTypeLabel,
} from "@/lib/artist-files";
import {
  getArtistReleaseStatusLabel,
  getReleaseStatusTone,
  getReleaseTypeBadgeLabel,
  getReleaseTypeLabel,
} from "@/lib/artist-releases";
import { requireArtist } from "@/lib/permissions";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  not_found: "No encontramos ese lanzamiento en tu cuenta.",
};

export default async function ArtistReleasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const { supabase, user } = await requireArtist();
  const { data: releases } = await supabase
    .from("releases")
    .select("id,release_type,title,primary_artist,status,desired_release_date,external_files_url,submitted_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const candidateReleases = (releases ?? []).filter(
    (release) => release.status !== "rejected" && release.status !== "cancelled",
  );
  const releaseIds = candidateReleases.map((release) => release.id);
  const [{ data: tracks }, { data: files }] =
    releaseIds.length > 0
      ? await Promise.all([
          supabase
            .from("release_tracks")
            .select("release_id,title,track_number")
            .in("release_id", releaseIds)
            .order("track_number", { ascending: true }),
          supabase
            .from("release_files")
            .select("release_id,file_type,original_filename,content_type,size_bytes,status,file_url,storage_provider,uploaded_at,created_at")
            .in("release_id", releaseIds)
            .order("created_at", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];
  const visibleReleases = candidateReleases.filter((release) => {
    if (release.status !== "draft") {
      return true;
    }

    return (files ?? []).some(
      (file) =>
        file.release_id === release.id &&
        file.status === "uploaded" &&
        file.storage_provider !== "external",
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="accent">Lanzamientos</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-normal">
            Tus lanzamientos
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Revisa tus lanzamientos enviados, su contenido, archivos y estado
            operativo.
          </p>
        </div>
        <Link
          href="/artist/releases/new"
          className={cn(buttonVariants(), "w-full sm:w-auto")}
        >
          <Plus className="size-4" />
          Nuevo lanzamiento
        </Link>
      </div>

      {status && messages[status] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {messages[status]}
        </div>
      ) : null}

      <div className="grid gap-4">
        {visibleReleases.map((release) => {
          const releaseTracks = (tracks ?? []).filter(
            (track) => track.release_id === release.id,
          );
          const releaseFiles = (files ?? []).filter(
            (file) =>
              file.release_id === release.id &&
              file.status === "uploaded" &&
              file.storage_provider !== "external",
          );
          const canModify = canModifyRelease(release);
          const actionLabel = canModify ? "Modificar" : "Ver";
          const mainFile = releaseFiles[0];
          const contentSummary = getContentSummary(
            release.release_type,
            releaseTracks.length,
          );

          return (
            <Card key={release.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                      {release.primary_artist}
                    </p>
                  </div>
                  <Badge tone={getReleaseStatusTone(release.status)}>
                    {getArtistReleaseStatusLabel(release.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div>
                    <p className="font-semibold text-foreground">Contenido</p>
                    <p>{contentSummary}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Archivo</p>
                    {mainFile ? (
                      <div className="grid gap-1">
                        <p className="font-medium text-foreground">
                          {mainFile.original_filename ??
                            getReleaseFileTypeLabel(mainFile.file_type)}
                        </p>
                        <p className="text-xs">
                          {getReleaseFileTypeLabel(mainFile.file_type)} /{" "}
                          {mainFile.content_type ?? "archivo"} /{" "}
                          {formatFileSize(mainFile.size_bytes)}
                        </p>
                      </div>
                    ) : (
                      <p>
                        {release.external_files_url
                          ? "Link externo agregado"
                          : "Sin archivo visible"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Fecha de subida</p>
                    <p>
                      {mainFile
                        ? formatDateTime(mainFile.uploaded_at ?? mainFile.created_at)
                        : release.desired_release_date ?? formatDateTime(release.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {canModify
                      ? "Puedes modificarlo antes del bloqueo operativo."
                      : "Después de 24 horas enviado, no se puede modificar."}
                  </p>
                  <Link
                    href={`/artist/releases/${release.id}`}
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "w-full sm:w-auto",
                    )}
                  >
                    {actionLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {visibleReleases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Todavía no tienes lanzamientos enviados. Crea uno nuevo cuando
              tengas la canción, video o link listo.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function canModifyRelease(release: {
  status: string;
  submitted_at?: string | null;
  created_at: string;
}) {
  if (release.status === "draft" || release.status === "needs_changes") {
    return true;
  }

  if (release.status !== "submitted") {
    return false;
  }

  const submittedAt = new Date(release.submitted_at ?? release.created_at).getTime();
  return Date.now() - submittedAt < 24 * 60 * 60 * 1000;
}

function getContentSummary(releaseType: string, trackCount: number) {
  if (releaseType === "video") {
    return "Video";
  }

  if (releaseType === "ep") {
    return trackCount > 0 ? `EP (${trackCount} canciones)` : "EP";
  }

  if (releaseType === "album") {
    return trackCount > 0 ? `Álbum (${trackCount} canciones)` : "Álbum";
  }

  return "Canción";
}
