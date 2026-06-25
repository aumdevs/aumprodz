import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Play,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { ServiceCard } from "@/components/public/service-card";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicServices } from "@/lib/content/services";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const [services, youtubeVideos] = await Promise.all([
    getPublicServices({ locale }),
    getPublicYoutubeVideos(3),
  ]);
  const workSteps = [
    { title: t(locale, "home.step1Title"), text: t(locale, "home.step1Text") },
    { title: t(locale, "home.step2Title"), text: t(locale, "home.step2Text") },
    { title: t(locale, "home.step3Title"), text: t(locale, "home.step3Text") },
  ];

  return (
    <>
      <PublicEventTracker eventName="page_view" page="/" source="home" />

      <section className="relative overflow-hidden border-b border-border bg-[#15110f] text-white">
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="relative mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm">
              <PlayCircle className="size-4" />
              {t(locale, "home.badge")}
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl">
                {t(locale, "home.title")}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/78">
                {t(locale, "home.description")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/servicios"
                className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
              >
                {t(locale, "home.services")}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/youtube"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "bg-white text-[#15110f] hover:bg-white/90",
                )}
              >
                {t(locale, "home.youtube")}
                <Play className="size-5 fill-current" />
              </Link>
              <WhatsappCtaLink
                service="youtube-adsense"
                source="home"
                placement="hero_whatsapp"
                page="/"
                label={t(locale, "home.whatsapp")}
                variant="ghost"
                size="lg"
                className="border border-white/24 text-white hover:bg-white/10"
              />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-white/16 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <div className="overflow-hidden rounded-md bg-[#070707]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="size-3 rounded-full bg-red-600" />
                  <span className="size-3 rounded-full bg-accent" />
                  <span className="size-3 rounded-full bg-white/35" />
                  <span className="ml-auto text-xs font-semibold text-white/54">
                    AUM PRODZ
                  </span>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative aspect-video overflow-hidden rounded-md border border-white/10 bg-[#1f1914]">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(220,38,38,0.32),rgba(212,167,70,0.22)_44%,rgba(7,7,7,0.78))]" />
                    <div className="absolute left-4 top-4 rounded-md bg-red-600 px-2 py-1 text-xs font-black uppercase text-white">
                      YouTube
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-16 items-center justify-center rounded-md bg-white text-red-600 shadow-xl">
                        <Play className="size-7 fill-current" />
                      </span>
                    </div>
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-xl font-black">
                        Servicios, música y contenido real
                      </p>
                      <p className="mt-1 text-sm text-white/68">
                        Una marca hecha para crear, vender y conectar.
                      </p>
                    </div>
                  </div>
                  <div className="grid content-between gap-3">
                    {["YouTube", "Web", "Imagen", "Artistas"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-md border border-white/10 bg-white/8 px-3 py-3"
                      >
                        <span className="text-sm font-bold">{item}</span>
                        <span className="h-2 w-16 rounded-full bg-red-600/80" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 px-5 py-4">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/76">
                    <span className="rounded-md bg-white/10 px-3 py-2">
                      Miniaturas
                    </span>
                    <span className="rounded-md bg-white/10 px-3 py-2">
                      Páginas web
                    </span>
                    <span className="rounded-md bg-white/10 px-3 py-2">
                      AdSense
                    </span>
                    <span className="rounded-md bg-white/10 px-3 py-2">
                      Lanzamientos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
              <Sparkles className="size-4" />
              {t(locale, "home.servicesBadge")}
            </div>
            <h2 className="mt-3 text-3xl font-bold">
              {t(locale, "home.servicesTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t(locale, "home.servicesText")}
            </p>
          </div>
          <Link
            href="/servicios"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Ver todo
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-red-600/10 px-3 py-2 text-sm font-bold text-red-700">
              <MessageCircle className="size-4" />
              {t(locale, "home.workBadge")}
            </div>
            <h2 className="mt-3 text-3xl font-bold">
              {t(locale, "home.workTitle")}
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {workSteps.map((item, index) => (
              <Card key={item.title}>
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-black">
                    {index + 1}
                  </span>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <YoutubeVideosSection videos={youtubeVideos} compact />
    </>
  );
}
