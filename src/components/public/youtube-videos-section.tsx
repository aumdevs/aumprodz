import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

  return (
    <section className={compact ? "border-y border-border bg-card" : ""}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge tone="accent">{t(locale, "youtube.badge")}</Badge>
            <h2 className="mt-3 text-3xl font-bold">
              {t(locale, "youtube.title")}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t(locale, "youtube.description")}
            </p>
          </div>
          <Link
            href="/youtube"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            {t(locale, "common.view")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-md border border-border bg-background"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-5 p-5">
                  <h3 className="line-clamp-3 text-2xl font-black leading-tight sm:text-3xl">
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
