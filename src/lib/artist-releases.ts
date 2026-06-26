import type { ComponentType } from "react";
import {
  Album,
  BadgeCheck,
  CircleDashed,
  Clock3,
  FileWarning,
  Music2,
  Send,
  UploadCloud,
  XCircle,
} from "lucide-react";

import { isUsableArtistAnnualSubscription } from "@/lib/artist-billing";
import type { AppLocale } from "@/lib/i18n/config";

export const releaseTypes = ["single", "ep", "album", "video"] as const;
export type ReleaseType = (typeof releaseTypes)[number];

export const releaseStatuses = [
  "draft",
  "submitted",
  "under_review",
  "needs_changes",
  "approved",
  "ready_for_tunecore",
  "uploaded_to_tunecore",
  "scheduled",
  "published",
  "rejected",
  "cancelled",
] as const;
export type ReleaseStatus = (typeof releaseStatuses)[number];
export const hiddenReleaseStatuses = ["draft", "rejected", "cancelled"] as const;
export const visibleReleaseStatuses = releaseStatuses.filter(
  (status) => !hiddenReleaseStatuses.includes(status as (typeof hiddenReleaseStatuses)[number]),
);

export const musicPlatforms = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "TikTok",
  "Instagram/Facebook",
  "Deezer",
  "Amazon Music",
  "Tidal",
  "Todas",
] as const;

export type ReleaseGate = {
  subscriptionStatus?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
  identityStatus?: string | null;
  contractStatus?: string | null;
  hasRequiredPayment?: boolean;
};

const releaseTypeLabelsByLocale: Record<AppLocale, Record<ReleaseType, string>> = {
  ht: {
    single: "Chante / Single",
    ep: "EP",
    album: "Albòm",
    video: "Videyo",
  },
  es: {
    single: "Canción / Single",
    ep: "EP",
    album: "Álbum",
    video: "Video",
  },
  en: {
    single: "Song / Single",
    ep: "EP",
    album: "Album",
    video: "Video",
  },
  fr: {
    single: "Chanson / Single",
    ep: "EP",
    album: "Album",
    video: "Vidéo",
  },
  pt: {
    single: "Música / Single",
    ep: "EP",
    album: "Álbum",
    video: "Vídeo",
  },
};

const releaseTypeBadgeLabelsByLocale: Record<AppLocale, Record<ReleaseType, string>> = {
  ht: {
    single: "Chante",
    ep: "EP",
    album: "Albòm",
    video: "Videyo",
  },
  es: {
    single: "Canción",
    ep: "EP",
    album: "Álbum",
    video: "Video",
  },
  en: {
    single: "Song",
    ep: "EP",
    album: "Album",
    video: "Video",
  },
  fr: {
    single: "Chanson",
    ep: "EP",
    album: "Album",
    video: "Vidéo",
  },
  pt: {
    single: "Música",
    ep: "EP",
    album: "Álbum",
    video: "Vídeo",
  },
};

const releaseStatusLabelsByLocale: Record<AppLocale, Record<ReleaseStatus, string>> = {
  ht: {
    draft: "Ap prepare",
    submitted: "An atant revizyon",
    under_review: "An atant revizyon",
    needs_changes: "Bezwen chanjman",
    approved: "Verifye",
    ready_for_tunecore: "Verifye",
    uploaded_to_tunecore: "Verifye",
    scheduled: "Pwograme",
    published: "Pibliye",
    rejected: "Rejte",
    cancelled: "Anile",
  },
  es: {
    draft: "Preparando",
    submitted: "Pendiente de revisión",
    under_review: "Pendiente de revisión",
    needs_changes: "Requiere cambios",
    approved: "Verificado",
    ready_for_tunecore: "Verificado",
    uploaded_to_tunecore: "Verificado",
    scheduled: "Programado",
    published: "Publicado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
  },
  en: {
    draft: "Preparing",
    submitted: "Pending review",
    under_review: "Pending review",
    needs_changes: "Needs changes",
    approved: "Verified",
    ready_for_tunecore: "Verified",
    uploaded_to_tunecore: "Verified",
    scheduled: "Scheduled",
    published: "Published",
    rejected: "Rejected",
    cancelled: "Cancelled",
  },
  fr: {
    draft: "En préparation",
    submitted: "En attente de révision",
    under_review: "En attente de révision",
    needs_changes: "Modifications requises",
    approved: "Vérifié",
    ready_for_tunecore: "Vérifié",
    uploaded_to_tunecore: "Vérifié",
    scheduled: "Programmé",
    published: "Publié",
    rejected: "Rejeté",
    cancelled: "Annulé",
  },
  pt: {
    draft: "Preparando",
    submitted: "Pendente de revisão",
    under_review: "Pendente de revisão",
    needs_changes: "Requer alterações",
    approved: "Verificado",
    ready_for_tunecore: "Verificado",
    uploaded_to_tunecore: "Verificado",
    scheduled: "Agendado",
    published: "Publicado",
    rejected: "Rejeitado",
    cancelled: "Cancelado",
  },
};

const artistReleaseStatusLabelsByLocale: Record<AppLocale, Record<ReleaseStatus, string>> = {
  ht: {
    draft: "Voye",
    submitted: "Resevwa",
    under_review: "Resevwa",
    needs_changes: "Bezwen chanjman",
    approved: "An pwosesis",
    ready_for_tunecore: "An pwosesis",
    uploaded_to_tunecore: "An pwosesis",
    scheduled: "Pwograme",
    published: "Disponib sou platfòm",
    rejected: "Pa apwouve",
    cancelled: "Anile",
  },
  es: {
    draft: "Enviado",
    submitted: "Recibido",
    under_review: "Recibido",
    needs_changes: "Requiere cambios",
    approved: "En proceso",
    ready_for_tunecore: "En proceso",
    uploaded_to_tunecore: "En proceso",
    scheduled: "Programado",
    published: "Disponible en plataforma",
    rejected: "No aprobado",
    cancelled: "Cancelado",
  },
  en: {
    draft: "Sent",
    submitted: "Received",
    under_review: "Received",
    needs_changes: "Needs changes",
    approved: "In process",
    ready_for_tunecore: "In process",
    uploaded_to_tunecore: "In process",
    scheduled: "Scheduled",
    published: "Available on platform",
    rejected: "Not approved",
    cancelled: "Cancelled",
  },
  fr: {
    draft: "Envoyé",
    submitted: "Reçu",
    under_review: "Reçu",
    needs_changes: "Modifications requises",
    approved: "En cours",
    ready_for_tunecore: "En cours",
    uploaded_to_tunecore: "En cours",
    scheduled: "Programmé",
    published: "Disponible sur plateforme",
    rejected: "Non approuvé",
    cancelled: "Annulé",
  },
  pt: {
    draft: "Enviado",
    submitted: "Recebido",
    under_review: "Recebido",
    needs_changes: "Requer alterações",
    approved: "Em processo",
    ready_for_tunecore: "Em processo",
    uploaded_to_tunecore: "Em processo",
    scheduled: "Agendado",
    published: "Disponível na plataforma",
    rejected: "Não aprovado",
    cancelled: "Cancelado",
  },
};

const fallbackReleaseLabelByLocale: Record<AppLocale, string> = {
  ht: "Lansman",
  es: "Lanzamiento",
  en: "Release",
  fr: "Sortie",
  pt: "Lançamento",
};

const noStatusLabelByLocale: Record<AppLocale, string> = {
  ht: "San eta",
  es: "Sin estado",
  en: "No status",
  fr: "Sans statut",
  pt: "Sem status",
};

export function getReleaseTypeLabel(
  type?: string | null,
  locale: AppLocale = "es",
) {
  return (
    releaseTypeLabelsByLocale[locale][type as ReleaseType] ??
    fallbackReleaseLabelByLocale[locale]
  );
}

export function getReleaseTypeBadgeLabel(
  type?: string | null,
  locale: AppLocale = "es",
) {
  return (
    releaseTypeBadgeLabelsByLocale[locale][type as ReleaseType] ??
    fallbackReleaseLabelByLocale[locale]
  );
}

export function getReleaseStatusLabel(
  status?: string | null,
  locale: AppLocale = "es",
) {
  return (
    releaseStatusLabelsByLocale[locale][status as ReleaseStatus] ??
    status ??
    noStatusLabelByLocale[locale]
  );
}

export function getArtistReleaseStatusLabel(
  status?: string | null,
  locale: AppLocale = "es",
) {
  return (
    artistReleaseStatusLabelsByLocale[locale][status as ReleaseStatus] ??
    status ??
    noStatusLabelByLocale[locale]
  );
}

export function getReleaseStatusTone(
  status?: string | null,
): "default" | "accent" | "muted" | "danger" {
  if (
    status === "approved" ||
    status === "ready_for_tunecore" ||
    status === "scheduled" ||
    status === "published"
  ) {
    return "accent";
  }

  if (status === "rejected" || status === "cancelled") {
    return "danger";
  }

  if (status === "submitted" || status === "under_review") {
    return "default";
  }

  return "muted";
}

export function getReleaseStatusIcon(status?: string | null): ComponentType<{ className?: string }> {
  if (status === "submitted") return Send;
  if (status === "under_review") return Clock3;
  if (status === "needs_changes") return FileWarning;
  if (status === "approved" || status === "published") return BadgeCheck;
  if (status === "ready_for_tunecore" || status === "uploaded_to_tunecore") return UploadCloud;
  if (status === "rejected" || status === "cancelled") return XCircle;
  if (status === "album" || status === "ep") return Album;
  if (status === "single" || status === "video") return Music2;
  return CircleDashed;
}

export function getRequiredPaymentProductKey(type?: string | null) {
  if (type === "ep") {
    return "ep_release";
  }

  if (type === "album") {
    return "album_release";
  }

  return null;
}

export function canSubmitRelease({
  subscriptionStatus,
  subscriptionCurrentPeriodEnd,
  identityStatus,
  contractStatus,
  hasRequiredPayment = true,
}: ReleaseGate) {
  return (
    isUsableArtistAnnualSubscription({
      status: subscriptionStatus,
      current_period_end: subscriptionCurrentPeriodEnd,
    }) &&
    identityStatus === "verified" &&
    (contractStatus === "signed" || contractStatus === "completed") &&
    hasRequiredPayment
  );
}

export function getReleaseGateReasons({
  subscriptionStatus,
  subscriptionCurrentPeriodEnd,
  identityStatus,
  contractStatus,
  hasRequiredPayment = true,
}: ReleaseGate) {
  const reasons: string[] = [];

  if (
    !isUsableArtistAnnualSubscription({
      status: subscriptionStatus,
      current_period_end: subscriptionCurrentPeriodEnd,
    })
  ) {
    reasons.push("Falta suscripción anual activa.");
  }

  if (identityStatus !== "verified") {
    reasons.push("Falta identidad verificada.");
  }

  if (contractStatus !== "signed" && contractStatus !== "completed") {
    reasons.push("Falta contrato firmado.");
  }

  if (!hasRequiredPayment) {
    reasons.push("Falta pago único requerido para este tipo de lanzamiento.");
  }

  return reasons;
}

export function normalizeReleaseType(value: FormDataEntryValue | null): ReleaseType {
  return releaseTypes.includes(value as ReleaseType) ? (value as ReleaseType) : "single";
}

export function normalizeReleaseStatus(value: FormDataEntryValue | string | null): ReleaseStatus {
  return releaseStatuses.includes(value as ReleaseStatus)
    ? (value as ReleaseStatus)
    : "draft";
}
