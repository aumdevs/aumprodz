"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Headphones,
  ImageIcon,
  Play,
  Video,
  X,
} from "lucide-react";

import {
  canPreviewReleaseFile,
  formatFileSize,
  getReleaseFileTypeLabel,
} from "@/lib/artist-files";
import { cn, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export type AdminReleaseFilePanelRecord = {
  id: string;
  release_id: string;
  file_type: string;
  storage_provider: string;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  status: string;
  uploaded_at: string | null;
  created_at: string;
};

type AdminReleaseFilesPanelProps = {
  files: AdminReleaseFilePanelRecord[];
  canPreviewFiles: boolean;
  canDownloadFiles: boolean;
};

export function AdminReleaseFilesPanel({
  files,
  canPreviewFiles,
  canDownloadFiles,
}: AdminReleaseFilesPanelProps) {
  const [selectedFile, setSelectedFile] =
    useState<AdminReleaseFilePanelRecord | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedFile(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFile]);

  return (
    <>
      <div className="grid gap-2 rounded-md border border-border p-3">
        {files.map((file) => {
          const isUploaded = file.status === "uploaded";
          const canPreview =
            isUploaded && canPreviewFiles && canPreviewReleaseFile(file.file_type);

          return (
            <div
              key={file.id}
              className="grid gap-3 rounded-md bg-muted/45 p-3 text-sm lg:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <FileIcon fileType={file.file_type} />
                  <p className="break-all font-semibold">
                    {file.original_filename ??
                      getReleaseFileTypeLabel(file.file_type)}
                  </p>
                  <Badge tone={isUploaded ? "accent" : "muted"}>{file.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{getReleaseFileTypeLabel(file.file_type)}</span>
                  <span>{file.content_type ?? file.storage_provider}</span>
                  <span>{formatFileSize(file.size_bytes)}</span>
                  <span>
                    Subido: {formatDateTime(file.uploaded_at ?? file.created_at)}
                  </span>
                </div>
              </div>

              {isUploaded ? (
                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                  {canPreview ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedFile(file)}
                    >
                      <PreviewIcon fileType={file.file_type} />
                      {getPreviewLabel(file.file_type)}
                    </Button>
                  ) : null}
                  {canDownloadFiles ? (
                    <a
                      href={`/api/uploads/files/${file.id}?action=download`}
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "sm" }),
                      )}
                    >
                      <Download className="size-4" />
                      Descargar
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {files.length === 0 ? (
          <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Todavía no hay archivos subidos para este lanzamiento.
          </p>
        ) : null}
      </div>

      {selectedFile ? (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      ) : null}
    </>
  );
}

function FilePreviewModal({
  file,
  onClose,
}: {
  file: AdminReleaseFilePanelRecord;
  onClose: () => void;
}) {
  const title = file.original_filename ?? getReleaseFileTypeLabel(file.file_type);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {getReleaseFileTypeLabel(file.file_type)}
            </p>
            <h2 className="mt-1 break-all text-lg font-semibold">{title}</h2>
          </div>
          <Button
            aria-label="Cerrar vista previa"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-background p-4">
          {renderPreview(file)}
        </div>

        <div className="flex flex-col gap-2 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {file.content_type ?? file.storage_provider} /{" "}
            {formatFileSize(file.size_bytes)}
          </p>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderPreview(file: AdminReleaseFilePanelRecord) {
  const previewUrl = `/api/uploads/files/${file.id}?action=listen`;
  const title = file.original_filename ?? getReleaseFileTypeLabel(file.file_type);

  if (file.file_type === "audio") {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-md border border-border bg-muted p-6">
        <audio className="w-full" controls preload="metadata" src={previewUrl}>
          Tu navegador no puede reproducir este audio.
        </audio>
      </div>
    );
  }

  if (file.file_type === "video") {
    return (
      <video
        className="max-h-[68vh] w-full rounded-md bg-black object-contain"
        controls
        preload="metadata"
        src={previewUrl}
      >
        Tu navegador no puede reproducir este video.
      </video>
    );
  }

  if (file.file_type === "artwork") {
    if (file.content_type === "application/pdf") {
      return (
        <iframe
          className="h-[68vh] w-full rounded-md border border-border bg-background"
          src={previewUrl}
          title={title}
        />
      );
    }

    return (
      // Signed storage URLs are dynamic, so a plain img keeps the admin preview simple.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={title}
        className="max-h-[68vh] w-full rounded-md object-contain"
        src={previewUrl}
      />
    );
  }

  return (
    <iframe
      className="h-[68vh] w-full rounded-md border border-border bg-background"
      src={previewUrl}
      title={title}
    />
  );
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === "audio") {
    return <Headphones className="size-4 text-primary" />;
  }

  if (fileType === "video") {
    return <Video className="size-4 text-primary" />;
  }

  if (fileType === "artwork") {
    return <ImageIcon className="size-4 text-primary" />;
  }

  return <FileText className="size-4 text-primary" />;
}

function PreviewIcon({ fileType }: { fileType: string }) {
  if (fileType === "audio") {
    return <Headphones className="size-4" />;
  }

  if (fileType === "video") {
    return <Play className="size-4" />;
  }

  if (fileType === "artwork") {
    return <ImageIcon className="size-4" />;
  }

  return <Eye className="size-4" />;
}

function getPreviewLabel(fileType: string) {
  if (fileType === "audio") {
    return "Escuchar";
  }

  if (fileType === "video") {
    return "Ver video";
  }

  if (fileType === "artwork") {
    return "Ver portada";
  }

  return "Revisar";
}
