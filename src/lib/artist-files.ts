import type { AppLocale } from "@/lib/i18n/config";

export const artistSmallFilesBucket = "artist-small-files";

export const releaseFileTypes = [
  "audio",
  "artwork",
  "video",
  "lyrics",
  "document",
] as const;

export type ReleaseFileType = (typeof releaseFileTypes)[number];

export type ReleaseStorageProvider = "r2" | "supabase";

export const releaseFileTypeLabels: Record<ReleaseFileType, string> = {
  audio: "Audio / master",
  artwork: "Portada",
  video: "Video",
  lyrics: "Letra",
  document: "Documento",
};

const releaseFileTypeLabelsByLocale: Record<AppLocale, Record<ReleaseFileType, string>> = {
  ht: {
    audio: "Audio / master",
    artwork: "Portada",
    video: "Videyo",
    lyrics: "Pawòl",
    document: "Dokiman",
  },
  es: releaseFileTypeLabels,
  en: {
    audio: "Audio / master",
    artwork: "Cover",
    video: "Video",
    lyrics: "Lyrics",
    document: "Document",
  },
  fr: {
    audio: "Audio / master",
    artwork: "Pochette",
    video: "Vidéo",
    lyrics: "Paroles",
    document: "Document",
  },
  pt: {
    audio: "Áudio / master",
    artwork: "Capa",
    video: "Vídeo",
    lyrics: "Letra",
    document: "Documento",
  },
};

const allowedContentTypes: Record<ReleaseFileType, string[]> = {
  audio: [
    "audio/aiff",
    "audio/flac",
    "audio/m4a",
    "audio/mpeg",
    "audio/mp4",
    "audio/mp4a-latm",
    "audio/mp3",
    "audio/vnd.wave",
    "audio/wave",
    "audio/wav",
    "audio/x-aiff",
    "audio/x-flac",
    "audio/x-m4a",
    "audio/x-wav",
  ],
  artwork: ["image/jpeg", "image/png", "application/pdf"],
  video: ["video/mp4", "video/quicktime"],
  lyrics: [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  document: [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const maxUploadSizes: Record<ReleaseFileType, number> = {
  audio: 500 * 1024 * 1024,
  artwork: 20 * 1024 * 1024,
  video: 2 * 1024 * 1024 * 1024,
  lyrics: 25 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

export function getReleaseFileTypeLabel(
  type?: string | null,
  locale: AppLocale = "es",
) {
  const fallbackByLocale: Record<AppLocale, string> = {
    ht: "Fichye",
    es: "Archivo",
    en: "File",
    fr: "Fichier",
    pt: "Arquivo",
  };

  return (
    releaseFileTypeLabelsByLocale[locale][type as ReleaseFileType] ??
    fallbackByLocale[locale]
  );
}

export function isReleaseFileType(value?: string | null): value is ReleaseFileType {
  return releaseFileTypes.includes(value as ReleaseFileType);
}

export function getReleaseStorageProvider(
  fileType: ReleaseFileType,
): ReleaseStorageProvider {
  return fileType === "audio" || fileType === "video" ? "r2" : "supabase";
}

export function canPreviewReleaseFile(fileType?: string | null) {
  return fileType === "audio" || fileType === "video" || fileType === "artwork";
}

export function isAllowedReleaseFileContentType({
  fileType,
  contentType,
}: {
  fileType: ReleaseFileType;
  contentType: string;
}) {
  return allowedContentTypes[fileType].includes(contentType.toLowerCase());
}

export function resolveReleaseFileContentType({
  fileType,
  contentType,
  fileName,
}: {
  fileType: ReleaseFileType;
  contentType?: string | null;
  fileName: string;
}) {
  const normalized = (contentType ?? "").toLowerCase();

  if (
    normalized &&
    normalized !== "application/octet-stream" &&
    isAllowedReleaseFileContentType({ fileType, contentType: normalized })
  ) {
    return normalized;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  const inferred = extension ? inferredContentTypes[extension] : null;

  if (
    inferred &&
    isAllowedReleaseFileContentType({ fileType, contentType: inferred })
  ) {
    return inferred;
  }

  return normalized || "application/octet-stream";
}

export function getMaxReleaseFileSize(fileType: ReleaseFileType) {
  return maxUploadSizes[fileType];
}

export function buildReleaseFileStorageKey({
  userId,
  releaseId,
  fileType,
  fileName,
}: {
  userId: string;
  releaseId: string;
  fileType: ReleaseFileType;
  fileName: string;
}) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `artists/${userId}/releases/${releaseId}/${fileType}/${crypto.randomUUID()}-${safeName}`;
}

export function formatFileSize(sizeBytes?: number | null) {
  if (!sizeBytes || sizeBytes <= 0) {
    return "-";
  }

  if (sizeBytes >= 1024 * 1024 * 1024) {
    return `${(sizeBytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (sizeBytes >= 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${sizeBytes} B`;
}

const inferredContentTypes: Record<string, string> = {
  aif: "audio/aiff",
  aiff: "audio/aiff",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  flac: "audio/flac",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  m4a: "audio/mp4",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  pdf: "application/pdf",
  png: "image/png",
  txt: "text/plain",
  wav: "audio/wav",
  wave: "audio/wav",
};
