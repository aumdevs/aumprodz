import { ReleaseForm } from "@/components/artist/release-form";
import { Badge } from "@/components/ui/badge";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { listArtistSongOptions } from "@/lib/artist-song-options";
import { requirePaidArtist } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const pageCopyByLocale: Record<
  AppLocale,
  {
    badge: string;
    title: string;
    description: string;
    epCredits: string;
    albumCredits: string;
    messages: Record<string, string>;
    checkoutMessages: Record<string, string>;
  }
> = {
  ht: {
    badge: "Nouvo",
    title: "Kreye lansman",
    description:
      "Ranpli enfòmasyon an, chaje chante oswa videyo a, epi voye lansman an pou revizyon.",
    epCredits: "Plas EP disponib",
    albumCredits: "Plas albòm disponib",
    messages: {
      missing: "Tit ak atis prensipal obligatwa.",
      missing_submit:
        "Pou voye ou bezwen platfòm, fichye chaje oswa lyen ekstèn. EP ak albòm bezwen chante tou.",
      blocked: "Lansman an pa voye paske gen yon kondisyon kont ki manke toujou.",
      error: "Nou pa t kapab sove lansman an.",
    },
    checkoutMessages: {
      ep_release_success: "Peman EP resevwa. Chwazi EP epi ranpli lansman an.",
      album_release_success:
        "Peman albòm resevwa. Chwazi albòm epi ranpli lansman an.",
      ep_release_cancelled: "Peman EP a te anile.",
      album_release_cancelled: "Peman albòm nan te anile.",
      ep_release_credit_available:
        "Ou gen yon peman EP disponib. Chwazi EP epi ranpli lansman an.",
      album_release_credit_available:
        "Ou gen yon peman albòm disponib. Chwazi albòm epi ranpli lansman an.",
    },
  },
  es: {
    badge: "Nuevo",
    title: "Crear lanzamiento",
    description:
      "Completa la información, sube la canción o video, y envía el lanzamiento a revisión.",
    epCredits: "Cupos EP disponibles",
    albumCredits: "Cupos álbum disponibles",
    messages: {
      missing: "Título y artista principal son obligatorios.",
      missing_submit:
        "Para enviar necesitas plataformas, archivo subido o link externo. EP y álbum también necesitan canciones.",
      blocked:
        "El lanzamiento quedó sin enviar porque todavía falta un requisito de cuenta.",
      error: "No se pudo guardar el lanzamiento.",
    },
    checkoutMessages: {
      ep_release_success: "Pago EP recibido. Selecciona EP y completa el lanzamiento.",
      album_release_success:
        "Pago álbum recibido. Selecciona álbum y completa el lanzamiento.",
      ep_release_cancelled: "El pago EP fue cancelado.",
      album_release_cancelled: "El pago álbum fue cancelado.",
      ep_release_credit_available:
        "Ya tienes un pago EP disponible. Selecciona EP y completa el lanzamiento.",
      album_release_credit_available:
        "Ya tienes un pago álbum disponible. Selecciona álbum y completa el lanzamiento.",
    },
  },
  en: {
    badge: "New",
    title: "Create release",
    description:
      "Complete the information, upload the song or video, and submit the release for review.",
    epCredits: "Available EP slots",
    albumCredits: "Available album slots",
    messages: {
      missing: "Title and main artist are required.",
      missing_submit:
        "To submit you need platforms, an uploaded file or external link. EP and album also need songs.",
      blocked: "The release was not submitted because an account requirement is still missing.",
      error: "The release could not be saved.",
    },
    checkoutMessages: {
      ep_release_success: "EP payment received. Select EP and complete the release.",
      album_release_success:
        "Album payment received. Select album and complete the release.",
      ep_release_cancelled: "The EP payment was cancelled.",
      album_release_cancelled: "The album payment was cancelled.",
      ep_release_credit_available:
        "You have an available EP payment. Select EP and complete the release.",
      album_release_credit_available:
        "You have an available album payment. Select album and complete the release.",
    },
  },
  fr: {
    badge: "Nouveau",
    title: "Créer une sortie",
    description:
      "Complétez les informations, chargez la chanson ou vidéo, puis envoyez la sortie en révision.",
    epCredits: "Places EP disponibles",
    albumCredits: "Places album disponibles",
    messages: {
      missing: "Le titre et l'artiste principal sont obligatoires.",
      missing_submit:
        "Pour envoyer, il faut des plateformes, un fichier chargé ou un lien externe. EP et album ont aussi besoin de chansons.",
      blocked: "La sortie n'a pas été envoyée car une condition du compte manque encore.",
      error: "La sortie n'a pas pu être enregistrée.",
    },
    checkoutMessages: {
      ep_release_success: "Paiement EP reçu. Sélectionnez EP et complétez la sortie.",
      album_release_success:
        "Paiement album reçu. Sélectionnez album et complétez la sortie.",
      ep_release_cancelled: "Le paiement EP a été annulé.",
      album_release_cancelled: "Le paiement album a été annulé.",
      ep_release_credit_available:
        "Vous avez un paiement EP disponible. Sélectionnez EP et complétez la sortie.",
      album_release_credit_available:
        "Vous avez un paiement album disponible. Sélectionnez album et complétez la sortie.",
    },
  },
  pt: {
    badge: "Novo",
    title: "Criar lançamento",
    description:
      "Complete as informações, envie a música ou vídeo e mande o lançamento para revisão.",
    epCredits: "Vagas EP disponíveis",
    albumCredits: "Vagas álbum disponíveis",
    messages: {
      missing: "Título e artista principal são obrigatórios.",
      missing_submit:
        "Para enviar você precisa de plataformas, arquivo enviado ou link externo. EP e álbum também precisam de músicas.",
      blocked: "O lançamento não foi enviado porque ainda falta um requisito da conta.",
      error: "Não foi possível salvar o lançamento.",
    },
    checkoutMessages: {
      ep_release_success: "Pagamento EP recebido. Selecione EP e complete o lançamento.",
      album_release_success:
        "Pagamento álbum recebido. Selecione álbum e complete o lançamento.",
      ep_release_cancelled: "O pagamento EP foi cancelado.",
      album_release_cancelled: "O pagamento álbum foi cancelado.",
      ep_release_credit_available:
        "Você tem um pagamento EP disponível. Selecione EP e complete o lançamento.",
      album_release_credit_available:
        "Você tem um pagamento álbum disponível. Selecione álbum e complete o lançamento.",
    },
  },
};

export default async function NewReleasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const checkout = Array.isArray(params.checkout)
    ? params.checkout[0]
    : params.checkout;
  const locale = await getCurrentLocale();
  const copy = pageCopyByLocale[locale] ?? pageCopyByLocale.ht;
  const { supabase, user } = await requirePaidArtist();
  const [{ data: artistProfile }, { data: availablePayments }, artistSongOptions] =
    await Promise.all([
      supabase
        .from("artist_profiles")
        .select("artist_name,genre")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("artist_payments")
        .select("product_key")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .is("release_id", null)
        .in("product_key", ["ep_release", "album_release"]),
      listArtistSongOptions({ supabase, userId: user.id }),
    ]);
  const availablePaymentProductKeys = (availablePayments ?? []).map(
    (payment) => payment.product_key,
  );
  const epCredits = availablePaymentProductKeys.filter(
    (key) => key === "ep_release",
  ).length;
  const albumCredits = availablePaymentProductKeys.filter(
    (key) => key === "album_release",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="accent">{copy.badge}</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {copy.description}
        </p>
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

      <div className="grid gap-3 rounded-md border border-border bg-muted p-4 text-sm md:grid-cols-2">
        <div>
          <p className="font-semibold text-foreground">{copy.epCredits}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{epCredits}</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{copy.albumCredits}</p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {albumCredits}
          </p>
        </div>
      </div>

      <ReleaseForm
        locale={locale}
        release={{
          primary_artist: artistProfile?.artist_name,
          genre: artistProfile?.genre,
        }}
        tracks={[]}
        availablePaymentProductKeys={availablePaymentProductKeys}
        artistSongOptions={artistSongOptions}
        showInlineUploader
      />
    </div>
  );
}
