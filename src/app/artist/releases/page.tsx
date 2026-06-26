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
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { requirePaidArtist } from "@/lib/permissions";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const pageCopyByLocale: Record<
  AppLocale,
  {
    badge: string;
    title: string;
    description: string;
    newRelease: string;
    messages: Record<string, string>;
    byArtist: (artist: string | null) => string;
    content: string;
    file: string;
    uploadedAt: string;
    externalLink: string;
    noVisibleFile: string;
    canModify: string;
    cannotModify: string;
    modify: string;
    view: string;
    empty: string;
    fileFallback: string;
    song: string;
    songs: (count: number) => string;
    album: string;
  }
> = {
  ht: {
    badge: "Lansman",
    title: "Lansman ou yo",
    description:
      "Revize lansman ou voye yo, kontni yo, fichye yo ak eta operasyon an.",
    newRelease: "Nouvo lansman",
    messages: {
      not_found: "Nou pa jwenn lansman sa a nan kont ou.",
    },
    byArtist: (artist) => `pa ${artist ?? ""}`,
    content: "Kontni",
    file: "Fichye",
    uploadedAt: "Dat chajman",
    externalLink: "Lyen ekstèn ajoute",
    noVisibleFile: "San fichye vizib",
    canModify: "Ou ka modifye l anvan blokaj operasyon an.",
    cannotModify: "Apre 24 èdtan depi li voye, ou pa ka modifye l.",
    modify: "Modifye",
    view: "Gade",
    empty:
      "Ou poko gen lansman voye. Kreye youn lè chante, videyo oswa lyen an pare.",
    fileFallback: "fichye",
    song: "Chante",
    songs: (count) => `${count} chante`,
    album: "Albòm",
  },
  es: {
    badge: "Lanzamientos",
    title: "Tus lanzamientos",
    description:
      "Revisa tus lanzamientos enviados, su contenido, archivos y estado operativo.",
    newRelease: "Nuevo lanzamiento",
    messages: {
      not_found: "No encontramos ese lanzamiento en tu cuenta.",
    },
    byArtist: (artist) => `por ${artist ?? ""}`,
    content: "Contenido",
    file: "Archivo",
    uploadedAt: "Fecha de subida",
    externalLink: "Link externo agregado",
    noVisibleFile: "Sin archivo visible",
    canModify: "Puedes modificarlo antes del bloqueo operativo.",
    cannotModify: "Después de 24 horas enviado, no se puede modificar.",
    modify: "Modificar",
    view: "Ver",
    empty:
      "Todavía no tienes lanzamientos enviados. Crea uno nuevo cuando tengas la canción, video o link listo.",
    fileFallback: "archivo",
    song: "Canción",
    songs: (count) => `${count} canciones`,
    album: "Álbum",
  },
  en: {
    badge: "Releases",
    title: "Your releases",
    description:
      "Review submitted releases, content, files and operational status.",
    newRelease: "New release",
    messages: {
      not_found: "We could not find that release in your account.",
    },
    byArtist: (artist) => `by ${artist ?? ""}`,
    content: "Content",
    file: "File",
    uploadedAt: "Upload date",
    externalLink: "External link added",
    noVisibleFile: "No visible file",
    canModify: "You can modify it before operational lock.",
    cannotModify: "After 24 hours submitted, it cannot be modified.",
    modify: "Modify",
    view: "View",
    empty:
      "You do not have submitted releases yet. Create one when the song, video or link is ready.",
    fileFallback: "file",
    song: "Song",
    songs: (count) => `${count} songs`,
    album: "Album",
  },
  fr: {
    badge: "Sorties",
    title: "Vos sorties",
    description:
      "Révisez vos sorties envoyées, leur contenu, fichiers et statut opérationnel.",
    newRelease: "Nouvelle sortie",
    messages: {
      not_found: "Nous n'avons pas trouvé cette sortie dans votre compte.",
    },
    byArtist: (artist) => `par ${artist ?? ""}`,
    content: "Contenu",
    file: "Fichier",
    uploadedAt: "Date de chargement",
    externalLink: "Lien externe ajouté",
    noVisibleFile: "Aucun fichier visible",
    canModify: "Vous pouvez la modifier avant le blocage opérationnel.",
    cannotModify: "Après 24 heures d'envoi, elle ne peut plus être modifiée.",
    modify: "Modifier",
    view: "Voir",
    empty:
      "Vous n'avez pas encore de sorties envoyées. Créez-en une quand la chanson, vidéo ou lien est prêt.",
    fileFallback: "fichier",
    song: "Chanson",
    songs: (count) => `${count} chansons`,
    album: "Album",
  },
  pt: {
    badge: "Lançamentos",
    title: "Seus lançamentos",
    description:
      "Revise seus lançamentos enviados, conteúdo, arquivos e estado operacional.",
    newRelease: "Novo lançamento",
    messages: {
      not_found: "Não encontramos esse lançamento na sua conta.",
    },
    byArtist: (artist) => `por ${artist ?? ""}`,
    content: "Conteúdo",
    file: "Arquivo",
    uploadedAt: "Data de envio",
    externalLink: "Link externo adicionado",
    noVisibleFile: "Sem arquivo visível",
    canModify: "Você pode modificar antes do bloqueio operacional.",
    cannotModify: "Depois de 24 horas enviado, não pode ser modificado.",
    modify: "Modificar",
    view: "Ver",
    empty:
      "Você ainda não tem lançamentos enviados. Crie um quando a música, vídeo ou link estiver pronto.",
    fileFallback: "arquivo",
    song: "Música",
    songs: (count) => `${count} músicas`,
    album: "Álbum",
  },
};

export default async function ArtistReleasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const locale = await getCurrentLocale();
  const copy = pageCopyByLocale[locale] ?? pageCopyByLocale.ht;
  const { supabase, user } = await requirePaidArtist();
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
          <Badge tone="accent">{copy.badge}</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <Link
          href="/artist/releases/new"
          className={cn(buttonVariants(), "w-full sm:w-auto")}
        >
          <Plus className="size-4" />
          {copy.newRelease}
        </Link>
      </div>

      {status && copy.messages[status] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {copy.messages[status]}
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
          const actionLabel = canModify ? copy.modify : copy.view;
          const mainFile = releaseFiles[0];
          const contentSummary = getContentSummary(
            release.release_type,
            releaseTracks.length,
            copy,
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
                        {getReleaseTypeBadgeLabel(release.release_type, locale)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {getReleaseTypeLabel(release.release_type, locale)}{" "}
                      {copy.byArtist(release.primary_artist)}
                    </p>
                  </div>
                  <Badge tone={getReleaseStatusTone(release.status)}>
                    {getArtistReleaseStatusLabel(release.status, locale)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div>
                    <p className="font-semibold text-foreground">{copy.content}</p>
                    <p>{contentSummary}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{copy.file}</p>
                    {mainFile ? (
                      <div className="grid gap-1">
                        <p className="font-medium text-foreground">
                          {mainFile.original_filename ??
                            getReleaseFileTypeLabel(mainFile.file_type, locale)}
                        </p>
                        <p className="text-xs">
                          {getReleaseFileTypeLabel(mainFile.file_type, locale)} /{" "}
                          {mainFile.content_type ?? copy.fileFallback} /{" "}
                          {formatFileSize(mainFile.size_bytes)}
                        </p>
                      </div>
                    ) : (
                      <p>
                        {release.external_files_url
                          ? copy.externalLink
                          : copy.noVisibleFile}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{copy.uploadedAt}</p>
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
                      ? copy.canModify
                      : copy.cannotModify}
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
              {copy.empty}
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

function getContentSummary(
  releaseType: string,
  trackCount: number,
  copy: (typeof pageCopyByLocale)[AppLocale],
) {
  if (releaseType === "video") {
    return "Video";
  }

  if (releaseType === "ep") {
    return trackCount > 0 ? `EP (${copy.songs(trackCount)})` : "EP";
  }

  if (releaseType === "album") {
    return trackCount > 0 ? `${copy.album} (${copy.songs(trackCount)})` : copy.album;
  }

  return copy.song;
}
