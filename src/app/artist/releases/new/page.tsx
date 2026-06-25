import { ReleaseForm } from "@/components/artist/release-form";
import { Badge } from "@/components/ui/badge";
import { listArtistSongOptions } from "@/lib/artist-song-options";
import { requireArtist } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  missing: "Título y artista principal son obligatorios.",
  missing_submit:
    "Para enviar necesitas plataformas, archivo subido o link externo. EP y álbum también necesitan canciones.",
  blocked:
    "El lanzamiento quedó sin enviar porque todavía falta un requisito de cuenta.",
  error: "No se pudo guardar el lanzamiento.",
};

const checkoutMessages: Record<string, string> = {
  ep_release_success: "Pago EP recibido. Selecciona EP y completa el lanzamiento.",
  album_release_success:
    "Pago álbum recibido. Selecciona álbum y completa el lanzamiento.",
  ep_release_cancelled: "El pago EP fue cancelado.",
  album_release_cancelled: "El pago álbum fue cancelado.",
  ep_release_credit_available:
    "Ya tienes un pago EP disponible. Selecciona EP y completa el lanzamiento.",
  album_release_credit_available:
    "Ya tienes un pago álbum disponible. Selecciona álbum y completa el lanzamiento.",
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
  const { supabase, user } = await requireArtist();
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
        <Badge tone="accent">Nuevo</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          Crear lanzamiento
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Completa la información, sube la canción o video, y envía el
          lanzamiento a revisión.
        </p>
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

      <div className="grid gap-3 rounded-md border border-border bg-muted p-4 text-sm md:grid-cols-2">
        <div>
          <p className="font-semibold text-foreground">Cupos EP disponibles</p>
          <p className="mt-1 text-2xl font-black text-foreground">{epCredits}</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Cupos álbum disponibles</p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {albumCredits}
          </p>
        </div>
      </div>

      <ReleaseForm
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
