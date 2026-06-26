import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { PublicYoutubeVideo } from "@/lib/content/youtube";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const youtubeChannelUrl =
  "https://www.youtube.com/@aumprodz7298/videos";

const copyByLocale: Record<
  AppLocale,
  {
    channelCta: string;
    channelText: string;
    empty: string;
    videoCta: string;
  }
> = {
  ht: {
    channelCta: "Gade kanal YouTube la",
    channelText: "Dekouvri plis videyo enteresan sou kanal la.",
    empty: "Pa gen videyo pou montre kounye a.",
    videoCta: "Gade video sa",
  },
  es: {
    channelCta: "Ver canal de YouTube completo",
    channelText: "Descubre más videos interesantes en el canal.",
    empty: "No hay videos para mostrar ahora.",
    videoCta: "Ver este video",
  },
  en: {
    channelCta: "View full YouTube channel",
    channelText: "Discover more interesting videos on the channel.",
    empty: "No videos to show right now.",
    videoCta: "Watch this video",
  },
  fr: {
    channelCta: "Voir la chaîne YouTube complète",
    channelText: "Découvrez plus de vidéos intéressantes sur la chaîne.",
    empty: "Aucune vidéo à afficher pour le moment.",
    videoCta: "Voir cette vidéo",
  },
  pt: {
    channelCta: "Ver canal completo no YouTube",
    channelText: "Descubra mais vídeos interessantes no canal.",
    empty: "Nenhum vídeo para mostrar agora.",
    videoCta: "Ver este vídeo",
  },
};

type YoutubeVideosSectionProps = {
  videos: PublicYoutubeVideo[];
  compact?: boolean;
};

export async function YoutubeVideosSection({
  videos,
}: YoutubeVideosSectionProps) {
  const locale = await getCurrentLocale();
  const copy = copyByLocale[locale] ?? copyByLocale.ht;

  return (
    <section className="public-section-tight">
      <div className="public-shell">
        {videos.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="mammouth-card group overflow-hidden rounded-3xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="grid gap-5 p-5">
                  <h3 className="line-clamp-3 text-xl font-black leading-tight">
                    {video.title}
                  </h3>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ size: "sm" }), "mx-auto w-fit sm:mx-0")}
                  >
                    {copy.videoCta}
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted p-6 text-sm text-muted-foreground">
            {copy.empty}
          </div>
        )}

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <p className="mammouth-subtitle text-xl">
            {copy.channelText}
          </p>
          <Link
            href={youtubeChannelUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-5")}
          >
            {copy.channelCta}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
