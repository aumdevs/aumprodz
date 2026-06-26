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
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { requireArtist } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const detailCopyByLocale: Record<
  AppLocale,
  {
    messages: Record<string, string>;
    checkoutMessages: Record<string, string>;
  }
> = {
  ht: {
    messages: {
      saved: "Lansman an sove.",
      submitted: "Lansman an voye pou revizyon.",
      missing: "Tit ak atis prensipal obligatwa.",
      missing_submit:
        "Pou voye ou bezwen platfòm, fichye chaje oswa lyen ekstèn. EP ak albòm bezwen chante tou.",
      blocked:
        "Nou pa t kapab voye paske peman anyèl, idantite, kontra oswa peman EP/albòm manke.",
      files: "Ou kapab chaje fichye prive kounye a.",
      locked: "Lansman sa a pa ka modifye pa atis ankò.",
      error: "Nou pa t kapab sove lansman an.",
    },
    checkoutMessages: {
      ep_release_success: "Peman EP resevwa pou lansman sa a.",
      album_release_success: "Peman albòm resevwa pou lansman sa a.",
      ep_release_cancelled: "Peman EP a te anile.",
      album_release_cancelled: "Peman albòm nan te anile.",
      ep_release_credit_available:
        "Ou gen yon peman EP disponib. Ou ka voye lansman sa a.",
      album_release_credit_available:
        "Ou gen yon peman albòm disponib. Ou ka voye lansman sa a.",
      ep_release_already_paid: "Lansman sa a deja gen peman EP asosye.",
      album_release_already_paid: "Lansman sa a deja gen peman albòm asosye.",
    },
  },
  es: {
    messages: {
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
    },
    checkoutMessages: {
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
    },
  },
  en: {
    messages: {
      saved: "Release saved.",
      submitted: "Release submitted for review.",
      missing: "Title and main artist are required.",
      missing_submit:
        "To submit you need platforms, an uploaded file or external link. EP and album also need songs.",
      blocked:
        "Could not submit because annual payment, identity, contract or EP/album payment is missing.",
      files: "You can now upload private files.",
      locked: "This release can no longer be edited by the artist.",
      error: "The release could not be saved.",
    },
    checkoutMessages: {
      ep_release_success: "EP payment received for this release.",
      album_release_success: "Album payment received for this release.",
      ep_release_cancelled: "The EP payment was cancelled.",
      album_release_cancelled: "The album payment was cancelled.",
      ep_release_credit_available:
        "You have an available EP payment. You can submit this release.",
      album_release_credit_available:
        "You have an available album payment. You can submit this release.",
      ep_release_already_paid: "This release already has an EP payment linked.",
      album_release_already_paid: "This release already has an album payment linked.",
    },
  },
  fr: {
    messages: {
      saved: "Sortie enregistrée.",
      submitted: "Sortie envoyée en révision.",
      missing: "Le titre et l'artiste principal sont obligatoires.",
      missing_submit:
        "Pour envoyer, il faut des plateformes, un fichier chargé ou un lien externe. EP et album ont aussi besoin de chansons.",
      blocked:
        "Impossible d'envoyer car paiement annuel, identité, contrat ou paiement EP/album manque.",
      files: "Vous pouvez maintenant charger des fichiers privés.",
      locked: "Cette sortie ne peut plus être modifiée par l'artiste.",
      error: "La sortie n'a pas pu être enregistrée.",
    },
    checkoutMessages: {
      ep_release_success: "Paiement EP reçu pour cette sortie.",
      album_release_success: "Paiement album reçu pour cette sortie.",
      ep_release_cancelled: "Le paiement EP a été annulé.",
      album_release_cancelled: "Le paiement album a été annulé.",
      ep_release_credit_available:
        "Vous avez un paiement EP disponible. Vous pouvez envoyer cette sortie.",
      album_release_credit_available:
        "Vous avez un paiement album disponible. Vous pouvez envoyer cette sortie.",
      ep_release_already_paid: "Cette sortie a déjà un paiement EP associé.",
      album_release_already_paid: "Cette sortie a déjà un paiement album associé.",
    },
  },
  pt: {
    messages: {
      saved: "Lançamento salvo.",
      submitted: "Lançamento enviado para revisão.",
      missing: "Título e artista principal são obrigatórios.",
      missing_submit:
        "Para enviar você precisa de plataformas, arquivo enviado ou link externo. EP e álbum também precisam de músicas.",
      blocked:
        "Não foi possível enviar porque falta pagamento anual, identidade, contrato ou pagamento EP/álbum.",
      files: "Você já pode enviar arquivos privados.",
      locked: "Este lançamento não pode mais ser editado pelo artista.",
      error: "Não foi possível salvar o lançamento.",
    },
    checkoutMessages: {
      ep_release_success: "Pagamento EP recebido para este lançamento.",
      album_release_success: "Pagamento álbum recebido para este lançamento.",
      ep_release_cancelled: "O pagamento EP foi cancelado.",
      album_release_cancelled: "O pagamento álbum foi cancelado.",
      ep_release_credit_available:
        "Você tem um pagamento EP disponível. Pode enviar este lançamento.",
      album_release_credit_available:
        "Você tem um pagamento álbum disponível. Pode enviar este lançamento.",
      ep_release_already_paid: "Este lançamento já tem pagamento EP associado.",
      album_release_already_paid: "Este lançamento já tem pagamento álbum associado.",
    },
  },
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
  const locale = await getCurrentLocale();
  const copy = detailCopyByLocale[locale] ?? detailCopyByLocale.ht;
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
            {getReleaseTypeBadgeLabel(release.release_type, locale)}
          </Badge>
          <h1 className="mt-3 text-3xl font-black tracking-normal">
            {release.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {release.primary_artist}
          </p>
        </div>
        <Badge tone={getReleaseStatusTone(release.status)}>
          {getArtistReleaseStatusLabel(release.status, locale)}
        </Badge>
      </div>

      {status && copy.messages[status] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {copy.messages[status]}
        </div>
      ) : null}

      {checkout && copy.checkoutMessages[checkout] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {copy.checkoutMessages[checkout]}
        </div>
      ) : null}

      <ReleaseForm
        locale={locale}
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
        locale={locale}
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
