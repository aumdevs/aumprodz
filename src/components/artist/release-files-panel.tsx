import { Download, Eye, FileAudio, UploadCloud } from "lucide-react";

import {
  canPreviewReleaseFile,
  formatFileSize,
  getReleaseFileTypeLabel,
} from "@/lib/artist-files";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { ReleaseFileUploader } from "@/components/artist/release-file-uploader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ReleaseFileRecord = {
  id: string;
  release_id: string;
  file_type: string;
  storage_provider: string;
  file_url: string | null;
  storage_key: string | null;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  status: string;
  uploaded_at: string | null;
  created_at: string;
};

type ReleaseFilesPanelProps = {
  locale: AppLocale;
  releaseId: string;
  files: ReleaseFileRecord[];
  editable?: boolean;
  showUploader?: boolean;
};

const filesCopyByLocale: Record<
  AppLocale,
  {
    uploadTitle: string;
    filesTitle: string;
    review: string;
    download: string;
    empty: string;
  }
> = {
  ht: {
    uploadTitle: "Chaje fichye",
    filesTitle: "Fichye lansman an",
    review: "Revize",
    download: "Telechaje",
    empty: "Pa gen fichye chaje pou lansman sa a ankò.",
  },
  es: {
    uploadTitle: "Carga de archivos",
    filesTitle: "Archivos del lanzamiento",
    review: "Revisar",
    download: "Descargar",
    empty: "Todavía no hay archivos subidos para este lanzamiento.",
  },
  en: {
    uploadTitle: "File upload",
    filesTitle: "Release files",
    review: "Review",
    download: "Download",
    empty: "No files have been uploaded for this release yet.",
  },
  fr: {
    uploadTitle: "Chargement de fichiers",
    filesTitle: "Fichiers de la sortie",
    review: "Réviser",
    download: "Télécharger",
    empty: "Aucun fichier chargé pour cette sortie pour le moment.",
  },
  pt: {
    uploadTitle: "Envio de arquivos",
    filesTitle: "Arquivos do lançamento",
    review: "Revisar",
    download: "Baixar",
    empty: "Ainda não há arquivos enviados para este lançamento.",
  },
};

export function ReleaseFilesPanel({
  locale,
  releaseId,
  files,
  editable = false,
  showUploader = false,
}: ReleaseFilesPanelProps) {
  const copy = filesCopyByLocale[locale] ?? filesCopyByLocale.ht;
  const visibleFiles = files.filter(
    (file) =>
      file.status !== "deleted" &&
      file.status !== "failed" &&
      file.status !== "pending_upload" &&
      file.storage_provider !== "external",
  );

  return (
    <Card id="release-files">
      <CardHeader>
        <UploadCloud className="size-5 text-primary" />
        <CardTitle>
          {showUploader ? copy.uploadTitle : copy.filesTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        {showUploader ? (
          <ReleaseFileUploader
            locale={locale}
            releaseId={releaseId}
            disabled={!editable}
          />
        ) : null}

        <div className="grid gap-3">
          {visibleFiles.map((file) => (
            <div
              key={file.id}
              className="grid gap-3 rounded-md border border-border p-3 text-sm lg:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <FileAudio className="size-4 text-primary" />
                  <p className="break-all font-semibold">
                    {file.original_filename ?? getReleaseFileTypeLabel(file.file_type, locale)}
                  </p>
                  <Badge tone={file.status === "uploaded" ? "accent" : "muted"}>
                    {file.status}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{getReleaseFileTypeLabel(file.file_type, locale)}</span>
                  <span>{file.storage_provider}</span>
                  <span>{formatFileSize(file.size_bytes)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                {file.status === "uploaded" && canPreviewReleaseFile(file.file_type) ? (
                  <a
                    href={`/api/uploads/files/${file.id}?action=listen`}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    <Eye className="size-4" />
                    {copy.review}
                  </a>
                ) : null}
                {file.status === "uploaded" ? (
                  <a
                    href={`/api/uploads/files/${file.id}?action=download`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    <Download className="size-4" />
                    {copy.download}
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          {visibleFiles.length === 0 ? (
            <p className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              {copy.empty}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
