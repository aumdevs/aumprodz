import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { PublicYoutubeVideo } from "@/lib/content/youtube";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

type YoutubeVideosSectionProps = {
  videos: PublicYoutubeVideo[];
  compact?: boolean;
};

export async function YoutubeVideosSection({
  videos,
  compact = false,
}: YoutubeVideosSectionProps) {
  const locale = await getCurrentLocale();
  const TitleTag = compact ? "h2" : "h1";

  return (
    <section className={compact ? "public-section-tight" : "public-section-tight"}>
      <div className="public-shell">
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
            {t(locale, "youtube.badge")}
          </p>
          <TitleTag className="mammouth-title mt-3 text-4xl sm:text-6xl">
              {t(locale, "youtube.title")}
            </TitleTag>
          <p className="mammouth-subtitle mt-4 text-xl">
              {t(locale, "youtube.description")}
            </p>
          {!compact ? (
          <Link
            href="/youtube"
              className={cn(buttonVariants({ variant: "secondary" }), "mt-6")}
          >
            {t(locale, "common.view")}
            <ArrowRight className="size-4" />
          </Link>
          ) : null}
        </div>

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
                    className={cn(buttonVariants({ size: "sm" }), "w-fit")}
                  >
                    {t(locale, "common.view")}
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted p-6 text-sm text-muted-foreground">
            {t(locale, "empty.reports")}
          </div>
        )}
      </div>
    </section>
  );
}
