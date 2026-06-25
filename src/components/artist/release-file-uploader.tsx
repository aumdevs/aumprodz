"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  formatFileSize,
  getReleaseFileTypeLabel,
  releaseFileTypes,
  type ReleaseFileType,
} from "@/lib/artist-files";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UploadResponse = {
  fileId: string;
  signedUrl: string;
  contentType: string;
  uploadMethod: "PUT";
};

export type ReleaseUploadSlot = {
  fileType: ReleaseFileType;
  label: string;
  acceptedFormats: string;
  accept: string;
  extensions: string[];
};

export function ReleaseFileUploader({
  releaseId,
  resolveReleaseId,
  onUploaded,
  onExternalLinkChange,
  disabled = false,
  slots,
  withExternalLinks = false,
}: {
  releaseId?: string | null;
  resolveReleaseId?: () => Promise<string | null | undefined>;
  onUploaded?: (fileId: string, releaseId: string) => void;
  onExternalLinkChange?: (hasExternalLink: boolean) => void;
  disabled?: boolean;
  slots?: ReleaseUploadSlot[];
  withExternalLinks?: boolean;
}) {
  if (slots?.length) {
    return (
      <div className="grid gap-3">
        {slots.map((slot) => (
          <ReleaseUploadSlotControl
            key={`${slot.fileType}-${slot.label}`}
            releaseId={releaseId}
            resolveReleaseId={resolveReleaseId}
            onUploaded={onUploaded}
            onExternalLinkChange={onExternalLinkChange}
            disabled={disabled}
            fixedSlot={slot}
            withExternalLink={withExternalLinks}
          />
        ))}
      </div>
    );
  }

  return (
    <ReleaseUploadSlotControl
      releaseId={releaseId}
      resolveReleaseId={resolveReleaseId}
      onUploaded={onUploaded}
      onExternalLinkChange={onExternalLinkChange}
      disabled={disabled}
      withExternalLink={withExternalLinks}
    />
  );
}

function ReleaseUploadSlotControl({
  releaseId,
  resolveReleaseId,
  onUploaded,
  onExternalLinkChange,
  disabled = false,
  fixedSlot,
  withExternalLink = false,
}: {
  releaseId?: string | null;
  resolveReleaseId?: () => Promise<string | null | undefined>;
  onUploaded?: (fileId: string, releaseId: string) => void;
  onExternalLinkChange?: (hasExternalLink: boolean) => void;
  disabled?: boolean;
  fixedSlot?: ReleaseUploadSlot;
  withExternalLink?: boolean;
}) {
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<ReleaseFileType>("audio");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileLabel, setUploadedFileLabel] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const activeSlot = fixedSlot ?? getDefaultUploadSlot(fileType);
  const selectedFileLabel = useMemo(() => {
    if (!file) {
      return uploadedFileLabel ?? "Seleccionar archivo";
    }

    return formatSelectedFileLabel(file);
  }, [file, uploadedFileLabel]);
  const hasExternalUrl = externalUrl.trim().length > 0;
  const fileControlsDisabled = disabled || isUploading || hasExternalUrl;
  const externalLinkDisabled = disabled || Boolean(file) || hasUploadedFile;
  const hasFileChoice = Boolean(file || uploadedFileLabel || hasUploadedFile);

  function handleFileChange(nextFile?: File | null) {
    setStatus(null);
    setProgress(0);

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!isFileAllowedForSlot(nextFile, activeSlot)) {
      setFile(null);
      setStatus(`Archivo incorrecto. ${activeSlot.acceptedFormats}`);
      return;
    }

    setFile(nextFile);
    setUploadedFileLabel(formatSelectedFileLabel(nextFile));
    setHasUploadedFile(false);
    setExternalUrl("");
    onExternalLinkChange?.(false);
    void uploadFile(nextFile);
  }

  async function uploadFile(fileToUpload: File) {
    if (disabled || isUploading) {
      return;
    }

    setIsUploading(true);
      setStatus("Preparando carga segura...");
    setProgress(0);

    try {
      const activeReleaseId = releaseId ?? (await resolveReleaseId?.());

      if (!activeReleaseId) {
        throw new Error("Completa los datos principales antes de subir archivos.");
      }

      const presignResponse = await fetch("/api/uploads/create-presigned-url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          releaseId: activeReleaseId,
          fileType: activeSlot.fileType,
          fileName: fileToUpload.name,
          contentType: fileToUpload.type || "application/octet-stream",
          sizeBytes: fileToUpload.size,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error(await readError(presignResponse));
      }

      const upload = (await presignResponse.json()) as UploadResponse;
      setStatus("Subiendo archivo...");
      let uploadedThroughProxy = false;

      try {
        await uploadWithProgress({
          file: fileToUpload,
          signedUrl: upload.signedUrl,
          contentType: upload.contentType,
          method: upload.uploadMethod,
          onProgress: setProgress,
        });
      } catch {
        setStatus("Storage directo bloqueado; subiendo por servidor seguro...");
        setProgress(0);
        uploadedThroughProxy = true;
        await uploadThroughServer({
          file: fileToUpload,
          fileId: upload.fileId,
          onProgress: setProgress,
        });
      }

      if (!uploadedThroughProxy) {
        setStatus("Registrando archivo...");
        const completeResponse = await fetch("/api/uploads/complete", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ fileId: upload.fileId }),
        });

        if (!completeResponse.ok) {
          throw new Error(await readError(completeResponse));
        }
      }

      setStatus("Archivo listo.");
      setFile(null);
      setUploadedFileLabel(formatSelectedFileLabel(fileToUpload));
      setHasUploadedFile(true);
      setProgress(100);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploaded?.(upload.fileId, activeReleaseId);
      router.refresh();
    } catch (error) {
      setFile(null);
      setUploadedFileLabel(null);
      setHasUploadedFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setStatus(error instanceof Error ? error.message : "No se pudo subir.");
    } finally {
      setIsUploading(false);
    }
  }

  function resetFileChoice() {
    setFile(null);
    setUploadedFileLabel(null);
    setHasUploadedFile(false);
    setStatus(null);
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const gridColumns = withExternalLink
    ? "md:grid-cols-[160px_minmax(220px,0.95fr)_minmax(260px,1fr)_auto]"
    : "md:grid-cols-[180px_1fr_auto]";

  return (
    <div className="grid gap-2 rounded-md border border-border bg-muted p-3">
      <div className={cn("grid gap-2 md:items-center", gridColumns)}>
        {fixedSlot ? (
          <div className="grid gap-1">
            <p className="font-semibold text-foreground">{fixedSlot.label}</p>
            <p className="text-xs text-muted-foreground">
              {fixedSlot.acceptedFormats}
            </p>
          </div>
        ) : (
          <select
            value={fileType}
            onChange={(event) => {
              setFileType(event.target.value as ReleaseFileType);
              setFile(null);
              setUploadedFileLabel(null);
              setHasUploadedFile(false);
              setStatus(null);
              setProgress(0);
            }}
            disabled={disabled || isUploading}
            className="h-11 rounded-md border border-border bg-background px-3 text-sm"
          >
            {releaseFileTypes.map((type) => (
              <option key={type} value={type}>
                {getReleaseFileTypeLabel(type)}
              </option>
            ))}
          </select>
        )}

        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept={activeSlot.accept}
          disabled={fileControlsDisabled}
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />
        <label
          htmlFor={fileControlsDisabled ? undefined : fileInputId}
          className={cn(
            "flex min-h-11 w-full cursor-pointer items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors",
            !hasFileChoice &&
              !isUploading &&
              "border-primary/50 bg-primary/5 text-primary",
            hasUploadedFile && "border-primary/40 bg-primary/10 text-foreground",
            fileControlsDisabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span className="truncate">{selectedFileLabel}</span>
        </label>

        {withExternalLink ? (
          <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
            <span>Link</span>
            <input type="hidden" name="external_file_type" value={activeSlot.fileType} />
            <input type="hidden" name="external_file_label" value={activeSlot.label} />
            <Input
              name="external_file_url"
              value={externalUrl}
              disabled={externalLinkDisabled}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                setExternalUrl(nextValue);
                onExternalLinkChange?.(nextValue.trim().length > 0);

                if (nextValue.trim()) {
                  setFile(null);
                  setUploadedFileLabel(null);
                  setHasUploadedFile(false);
                  setStatus(null);
                  setProgress(0);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }
              }}
              placeholder="Google Drive, Dropbox, WeTransfer..."
              className="h-11"
            />
          </label>
        ) : null}

        {hasFileChoice ? (
          <button
            type="button"
            onClick={resetFileChoice}
            disabled={disabled || isUploading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-3 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Quitar archivo seleccionado"
          >
            <X className="size-4" />
          </button>
        ) : (
          <span className="hidden md:block" />
        )}
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground md:ml-[160px]">
        {!hasFileChoice && !hasExternalUrl ? (
          <p>Selecciona un archivo para subirlo automáticamente o pega un link.</p>
        ) : null}
        {status ? <p>{status}</p> : null}
        {hasExternalUrl ? (
          <p>Usaremos el link externo para este archivo.</p>
        ) : null}
        {hasUploadedFile ? (
          <p>Archivo subido. El link externo queda desactivado.</p>
        ) : null}
        {isUploading || progress > 0 ? (
          <div className="h-2 overflow-hidden rounded-md bg-background">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.max(progress, isUploading ? 8 : 0)}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getDefaultUploadSlot(fileType: ReleaseFileType): ReleaseUploadSlot {
  return {
    fileType,
    label: getReleaseFileTypeLabel(fileType),
    acceptedFormats: getAcceptedFormatText(fileType),
    accept: getAcceptValue(fileType),
    extensions: getAcceptedExtensions(fileType),
  };
}

export function buildReleaseUploadSlot({
  fileType,
  label,
}: {
  fileType: ReleaseFileType;
  label: string;
}): ReleaseUploadSlot {
  return {
    fileType,
    label,
    acceptedFormats: getAcceptedFormatText(fileType),
    accept: getAcceptValue(fileType),
    extensions: getAcceptedExtensions(fileType),
  };
}

function getAcceptedExtensions(fileType: ReleaseFileType) {
  const extensions: Record<ReleaseFileType, string[]> = {
    audio: ["wav", "aiff", "aif", "flac", "mp3", "m4a"],
    artwork: ["jpg", "jpeg", "png", "pdf"],
    video: ["mp4", "mov"],
    lyrics: ["txt", "docx", "pdf"],
    document: ["txt", "docx", "pdf"],
  };

  return extensions[fileType];
}

function getAcceptedFormatText(fileType: ReleaseFileType) {
  const labels: Record<ReleaseFileType, string> = {
    audio: "Formatos aceptados: MP3, WAV, AIFF, FLAC, M4A.",
    artwork: "Formatos aceptados: JPG, PNG, PDF.",
    video: "Formatos aceptados: MP4, MOV.",
    lyrics: "Formatos aceptados: TXT, DOCX, PDF.",
    document: "Formatos aceptados: TXT, DOCX, PDF.",
  };

  return labels[fileType];
}

function getAcceptValue(fileType: ReleaseFileType) {
  return getAcceptedExtensions(fileType)
    .map((extension) => `.${extension}`)
    .join(",");
}

function isFileAllowedForSlot(file: File, slot: ReleaseUploadSlot) {
  const extension = getFileExtension(file.name);

  return Boolean(extension && slot.extensions.includes(extension));
}

function formatSelectedFileLabel(file: File) {
  const extension = getFileExtension(file.name);
  const fileKind = extension ? `.${extension}` : file.type || "archivo";

  return `${file.name} (${fileKind}, ${formatFileSize(file.size)})`;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function uploadWithProgress({
  file,
  signedUrl,
  contentType,
  method,
  onProgress,
}: {
  file: File;
  signedUrl: string;
  contentType: string;
  method: "PUT";
  onProgress: (value: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, signedUrl);
    request.setRequestHeader("content-type", contentType);
    request.setRequestHeader("cache-control", "max-age=3600");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      reject(new Error(`Storage rechazó la carga (${request.status}).`));
    };
    request.onerror = () => reject(new Error("No se pudo conectar con Storage."));
    request.send(file);
  });
}

function uploadThroughServer({
  file,
  fileId,
  onProgress,
}: {
  file: File;
  fileId: string;
  onProgress: (value: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const formData = new FormData();
    formData.set("fileId", fileId);
    formData.set("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/uploads/proxy");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      reject(new Error(readXhrError(request)));
    };
    request.onerror = () =>
      reject(new Error("No se pudo subir el archivo por el servidor."));
    request.send(formData);
  });
}

function readXhrError(request: XMLHttpRequest) {
  try {
    const body = JSON.parse(request.responseText) as { error?: string };
    return body.error ?? `El servidor rechazó la carga (${request.status}).`;
  } catch {
    return `El servidor rechazó la carga (${request.status}).`;
  }
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "No se pudo completar la acción.";
  } catch {
    return "No se pudo completar la acción.";
  }
}
