import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  createYoutubeVideoAction,
  deleteYoutubeVideoAction,
  updateYoutubeVideoAction,
} from "@/app/admin/youtube/actions";
import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAdminYoutubeVideos,
  youtubeVideosMigrationHint,
} from "@/lib/content/youtube";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminYoutubePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("content.manage", "/admin/youtube");
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const { videos, errors } = await getAdminYoutubeVideos();
  const isYoutubeTableMissing =
    status === "missing_table" || errors.includes(youtubeVideosMigrationHint);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Contenido"
        title="Videos publicados"
        description="Carga miniatura, título y link para publicar videos reales en la página y el home."
      />

      <StatusMessage status={status} />
      {isYoutubeTableMissing ? (
        <YoutubeMigrationNotice />
      ) : (
        <AdminDataAlert errors={errors} />
      )}

      <Card>
        <CardHeader>
          <PlayCircle className="size-5 text-red-600" />
          <CardTitle>Agregar video</CardTitle>
        </CardHeader>
        <CardContent>
          <YoutubeVideoForm
            action={createYoutubeVideoAction}
            disabled={isYoutubeTableMissing}
          />
        </CardContent>
      </Card>

      <div className="grid gap-5">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>{video.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Orden {video.sort_order} / {video.video_url}
                </p>
              </div>
              <Badge tone={video.is_active ? "default" : "muted"}>
                {video.is_active ? "Publicado" : "Oculto"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="overflow-hidden rounded-md border border-border bg-muted">
                <div className="relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-2 p-3">
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-muted"
                  >
                    Ver video en YouTube
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
              <div className="grid gap-4">
                <YoutubeVideoForm
                  action={updateYoutubeVideoAction}
                  id={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnail_url}
                  videoUrl={video.video_url}
                  sortOrder={video.sort_order}
                  isActive={video.is_active}
                  disabled={isYoutubeTableMissing}
                />
                <form action={deleteYoutubeVideoAction}>
                  <input type="hidden" name="id" value={video.id} />
                  <Button type="submit" variant="destructive">
                    <Trash2 className="size-4" />
                    Borrar publicación
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Todavía no hay videos cargados.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function YoutubeVideoForm({
  action,
  disabled = false,
  id,
  title,
  thumbnailUrl,
  videoUrl,
  sortOrder = 0,
  isActive = true,
}: {
  action: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
  id?: string;
  title?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return (
    <form action={action} className="grid gap-4">
      <fieldset
        disabled={disabled}
        className={disabled ? "grid gap-4 opacity-60" : "grid gap-4"}
      >
        {id ? <input type="hidden" name="id" value={id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Título del video
            <Input name="title" defaultValue={title ?? ""} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Orden
            <Input
              name="sort_order"
              type="number"
              defaultValue={String(sortOrder)}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Miniatura por link
            <Input
              name="thumbnail_url"
              defaultValue={thumbnailUrl ?? ""}
              placeholder="https://..."
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            O cargar miniatura
            <Input
              name="thumbnail_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </label>
        </div>
        <label className="space-y-2 text-sm font-medium">
          Link de YouTube
          <Input
            name="video_url"
            defaultValue={videoUrl ?? ""}
            placeholder="https://youtube.com/watch?v=..."
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              className="size-4 accent-primary"
              defaultChecked={isActive}
              name="is_active"
              type="checkbox"
            />
            Video visible en web pública
          </label>
          <Button type="submit" disabled={disabled}>
            <Save className="size-4" />
            Guardar video
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

function StatusMessage({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  const isSuccess = status === "saved" || status === "deleted";
  const message =
    status === "deleted"
      ? "Publicación de YouTube borrada y web pública revalidada."
      : status === "saved"
        ? "Video guardado y web pública revalidada."
        : status === "missing_table"
          ? "Falta aplicar la migración de videos en Supabase antes de guardar."
          : status === "missing"
            ? "Completa título, miniatura y un link válido de YouTube."
            : status === "not_found"
              ? "No se encontró esa publicación de YouTube."
              : "No se pudo guardar. Revisa título, miniatura, link o permisos.";

  return (
    <Card
      className={
        isSuccess ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
      }
    >
      <CardContent className="flex items-center gap-3 p-4 text-sm">
        {isSuccess ? (
          <CheckCircle2 className="size-4 text-primary" />
        ) : (
          <XCircle className="size-4 text-destructive" />
        )}
        <span className={isSuccess ? "text-primary" : "text-destructive"}>
          {message}
        </span>
      </CardContent>
    </Card>
  );
}

function YoutubeMigrationNotice() {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex gap-3 p-4 text-sm leading-6 text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-semibold">Falta la tabla de YouTube en Supabase.</p>
          <p className="text-destructive/80">
            Ejecuta esta migración en Supabase SQL Editor y recarga la página.
          </p>
          <code className="mt-2 block rounded-md border border-destructive/20 bg-background/50 px-3 py-2 text-xs text-destructive">
            supabase/migrations/202606250001_youtube_videos_cms.sql
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
