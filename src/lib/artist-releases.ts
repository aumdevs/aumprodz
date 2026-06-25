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

export function getReleaseTypeLabel(type?: string | null) {
  const labels: Record<ReleaseType, string> = {
    single: "Canción / Single",
    ep: "EP",
    album: "Álbum",
    video: "Video",
  };

  return labels[type as ReleaseType] ?? "Lanzamiento";
}

export function getReleaseTypeBadgeLabel(type?: string | null) {
  const labels: Record<ReleaseType, string> = {
    single: "Canción",
    ep: "EP",
    album: "Álbum",
    video: "Video",
  };

  return labels[type as ReleaseType] ?? "Lanzamiento";
}

export function getReleaseStatusLabel(status?: string | null) {
  const labels: Record<ReleaseStatus, string> = {
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
  };

  return labels[status as ReleaseStatus] ?? status ?? "Sin estado";
}

export function getArtistReleaseStatusLabel(status?: string | null) {
  const labels: Record<ReleaseStatus, string> = {
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
  };

  return labels[status as ReleaseStatus] ?? status ?? "Sin estado";
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
