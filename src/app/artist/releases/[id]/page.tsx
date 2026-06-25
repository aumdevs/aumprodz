import { redirect } from "next/navigation";

import { ReleaseForm } from "@/components/artist/release-form";
import {
  ReleaseFilesPanel,
  type ReleaseFileRecord,
} from "@/components/artist/release-files-panel";
import { Badge } from "@/components/ui/badge";
import {
  getArtistReleaseStatusLabel,
  getReleaseStatusTone,
  getReleaseTypeBadgeLabel,
} from "@/lib/artist-releases";
import { listArtistSongOptions } from "@/lib/artist-song-options";
import { requireArtist } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Lanzamiento guardado.",
  submitted: "Lanzamiento enviado a revisión.",
  missing: "Título y artista principal son obligatorios.",
  missing_submit:
    "Para enviar necesitas plataformas, archivo subido o link externo. EP y álbum también necesitan canciones.",
  blocked:
    "No se pudo enviar porque falta pago anual, identidad, contrato o pago EP/álbum.",
  files: "Ya puedes subir archivos privados.",
  locked: "Este lanzamiento ya no se puede editar desde artista.",
  error: "No se pudo guardar el lanzamiento.",
};

const checkoutMessages: Record<string, string> = {
  ep_release_success: "Pago EP recibido para este lanzamiento.",
  album_release_success: "Pago álbum recibido para este lanzamiento.",
  ep_release_cancelled: "El pago EP fue cancelado.",
  album_release_cancelled: "El pago álbum fue cancelado.",
  ep_release_credit_available:
    "Ya tienes un pago EP disponible. Puedes enviar este lanzamiento.",
  album_release_credit_available:
    "Ya tienes un pago álbum disponible. Puedes enviar este lanzamiento.",
  ep_release_already_paid: "Este lanzamiento ya tiene pago EP asociado.",
  album_release_already_paid: "Este lanzamiento ya tiene pago álbum asociado.",
};

export default async function ReleaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const status = Array.isArray(query.status) ? query.status[0] : query.status;
  const checkout = Array.isArray(query.checkout)
    ? query.checkout[0]
    : query.checkout;
  const autoSubmit = Array.isArray(query.autoSubmit)
    ? query.autoSubmit[0]
    : query.autoSubmit;
  const { supabase, user } = await requireArtist();
  const [
    { data: release },
    { data: tracks },
    { data: platforms },
    { data: payments },
    { data: availablePayments },
    { data: files },
    artistSongOptions,
  ] = await Promise.all([
    supabase
      .from("releases")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("release_tracks")
      .select("title,featured_artists,track_number")
      .eq("release_id", id)
      .order("track_number", { ascending: true }),
    supabase
      .from("release_platforms")
      .select("platform")
      .eq("release_id", id)
      .order("platform", { ascending: true }),
    supabase
      .from("artist_payments")
      .select("id,product_key,status,amount_total,currency,created_at")
      .eq("user_id", user.id)
      .eq("release_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("artist_payments")
      .select("product_key")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .is("release_id", null)
      .in("product_key", ["ep_release", "album_release"]),
    supabase
      .from("release_files")
      .select(
        "id,release_id,file_type,storage_provider,file_url,storage_key,original_filename,content_type,size_bytes,status,uploaded_at,created_at",
      )
      .eq("release_id", id)
      .order("created_at", { ascending: false }),
    listArtistSongOptions({ supabase, userId: user.id }),
  ]);

  if (!release) {
    redirect("/artist/releases?status=not_found");
  }

  if (release.status === "rejected" || release.status === "cancelled") {
    redirect("/artist/releases?status=not_found");
  }

  const editable = canModifyRelease(release);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone="accent">
            {getReleaseTypeBadgeLabel(release.release_type)}
          </Badge>
          <h1 className="mt-3 text-3xl font-black tracking-normal">
            {release.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {release.primary_artist}
          </p>
        </div>
        <Badge tone={getReleaseStatusTone(release.status)}>
          {getArtistReleaseStatusLabel(release.status)}
        </Badge>
      </div>

      {status && messages[status] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {messages[status]}
        </div>
      ) : null}

      {checkout && checkoutMessages[checkout] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {checkoutMessages[checkout]}
        </div>
      ) : null}

      <ReleaseForm
        release={release}
        selectedPlatforms={(platforms ?? []).map((row) => row.platform)}
        tracks={(tracks ?? []).map((row) => row.title)}
        trackFeaturedArtists={(tracks ?? []).map(
          (row) => row.featured_artists ?? "",
        )}
        availablePaymentProductKeys={[
          ...(payments ?? [])
            .filter((payment) => payment.status === "paid")
            .map((payment) => payment.product_key),
          ...(availablePayments ?? []).map((payment) => payment.product_key),
        ]}
        artistSongOptions={artistSongOptions}
        hasUploadedFiles={Boolean(
          release.external_files_url ||
            (files ?? []).some(
              (file) =>
                file.storage_provider === "external" ||
                file.status === "uploaded",
            ),
        )}
        autoSubmitOnReady={
          autoSubmit === "1" && typeof checkout === "string" && checkout.endsWith("_success")
        }
        editable={editable}
        showInlineUploader={editable}
      />

      <ReleaseFilesPanel
        releaseId={release.id}
        files={(files ?? []) as ReleaseFileRecord[]}
        editable={editable}
      />
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
