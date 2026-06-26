import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  MessageCircle,
  PlayCircle,
  Rocket,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { CTASection } from "@/components/public/cta-section";
import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { ServiceCard } from "@/components/public/service-card";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicServices } from "@/lib/content/services";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";
import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const homeVisualCopyByLocale: Record<
  AppLocale,
  {
    previewTitle: string;
    previewText: string;
    previewCategories: string[];
    previewTags: string[];
    viewAll: string;
    artistTitle: string;
    artistText: string;
    artistCta: string;
    artistLogin: string;
    trustTitle: string;
    trustText: string;
    metrics: Array<{ label: string; value: string }>;
  }
> = {
  ht: {
    previewTitle: "Sèvis, mizik ak kontni reyèl",
    previewText: "Yon mak ki fèt pou kreye, vann epi konekte.",
    previewCategories: ["YouTube", "Web", "Imaj", "Atis"],
    previewTags: ["Miniati", "Sit entènèt", "AdSense", "Lansman"],
    viewAll: "Gade tout",
    artistTitle: "Karyè mizikal ou, òganize nan yon sèl kote.",
    artistText:
      "Soti nan pwofil atis rive nan dosye, kontra, revizyon ak pwomosyon: AUM PRODZ ede w kenbe etap yo klè.",
    artistCta: "Kreye kont atis",
    artistLogin: "Mwen deja atis",
    trustTitle: "Nou òganize travay la ak respè pou reyalite a.",
    trustText:
      "AUM PRODZ akonpaye, oryante epi egzekite ak transparans. Nou pa vann pwomès enposib; nou bati pwosesis ki ka verifye.",
    metrics: [
      { label: "Sèvis dijital", value: "24/7" },
      { label: "Lang ofisyèl", value: "5" },
      { label: "Mòd atis", value: "Pro" },
    ],
  },
  es: {
    previewTitle: "Servicios, música y contenido real",
    previewText: "Una marca hecha para crear, vender y conectar.",
    previewCategories: ["YouTube", "Web", "Imagen", "Artistas"],
    previewTags: ["Miniaturas", "Páginas web", "AdSense", "Lanzamientos"],
    viewAll: "Ver todo",
    artistTitle: "Tu carrera musical organizada en un solo lugar.",
    artistText:
      "Perfil, lanzamientos, archivos, revisión, contratos y promoción en un flujo claro para artistas serios.",
    artistCta: "Crear cuenta de artista",
    artistLogin: "Ya soy artista",
    trustTitle: "Organizamos el trabajo con criterio y transparencia.",
    trustText:
      "AUM PRODZ orienta, acompaña y ejecuta. No promete resultados imposibles; construye procesos claros, medibles y profesionales.",
    metrics: [
      { label: "Servicios digitales", value: "24/7" },
      { label: "Idiomas oficiales", value: "5" },
      { label: "Modo artista", value: "Pro" },
    ],
  },
  en: {
    previewTitle: "Services, music and real content",
    previewText: "A brand built to create, sell and connect.",
    previewCategories: ["YouTube", "Web", "Image", "Artists"],
    previewTags: ["Thumbnails", "Websites", "AdSense", "Releases"],
    viewAll: "View all",
    artistTitle: "Your music career organized in one place.",
    artistText:
      "Profiles, releases, files, review, contracts and promotion in a clear flow for serious artists.",
    artistCta: "Create artist account",
    artistLogin: "I am already an artist",
    trustTitle: "We organize the work with clarity and trust.",
    trustText:
      "AUM PRODZ guides, supports and executes. We do not sell impossible promises; we build clear, measurable and professional processes.",
    metrics: [
      { label: "Digital services", value: "24/7" },
      { label: "Official languages", value: "5" },
      { label: "Artist mode", value: "Pro" },
    ],
  },
  fr: {
    previewTitle: "Services, musique et contenu réel",
    previewText: "Une marque faite pour créer, vendre et connecter.",
    previewCategories: ["YouTube", "Web", "Image", "Artistes"],
    previewTags: ["Miniatures", "Sites web", "AdSense", "Sorties"],
    viewAll: "Voir tout",
    artistTitle: "Votre carrière musicale organisée au même endroit.",
    artistText:
      "Profil, sorties, fichiers, révision, contrats et promotion dans un parcours clair pour les artistes sérieux.",
    artistCta: "Créer un compte artiste",
    artistLogin: "Je suis déjà artiste",
    trustTitle: "Nous organisons le travail avec clarté et confiance.",
    trustText:
      "AUM PRODZ oriente, accompagne et exécute. Nous ne promettons pas l'impossible; nous construisons des processus clairs et professionnels.",
    metrics: [
      { label: "Services digitaux", value: "24/7" },
      { label: "Langues officielles", value: "5" },
      { label: "Mode artiste", value: "Pro" },
    ],
  },
  pt: {
    previewTitle: "Serviços, música e conteúdo real",
    previewText: "Uma marca feita para criar, vender e conectar.",
    previewCategories: ["YouTube", "Web", "Imagem", "Artistas"],
    previewTags: ["Miniaturas", "Sites", "AdSense", "Lançamentos"],
    viewAll: "Ver tudo",
    artistTitle: "Sua carreira musical organizada em um só lugar.",
    artistText:
      "Perfil, lançamentos, arquivos, revisão, contratos e promoção em um fluxo claro para artistas sérios.",
    artistCta: "Criar conta de artista",
    artistLogin: "Já sou artista",
    trustTitle: "Organizamos o trabalho com clareza e confiança.",
    trustText:
      "AUM PRODZ orienta, acompanha e executa. Não vendemos promessas impossíveis; construímos processos claros e profissionais.",
    metrics: [
      { label: "Serviços digitais", value: "24/7" },
      { label: "Idiomas oficiais", value: "5" },
      { label: "Modo artista", value: "Pro" },
    ],
  },
};

const artistFlow = [
  { icon: CheckCircle2, label: "Perfil" },
  { icon: UploadCloud, label: "Lanzamiento" },
  { icon: FileSignature, label: "Contrato" },
  { icon: Rocket, label: "Promoción" },
];

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const visualCopy = homeVisualCopyByLocale[locale] ?? homeVisualCopyByLocale.ht;
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

      <section className="premium-grid relative overflow-hidden border-b border-border text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(242,201,76,0.18),transparent_26%),linear-gradient(135deg,rgba(8,10,18,0.3),rgba(8,10,18,1)_70%)]" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-primary/20" />
        <div className="relative mx-auto grid min-h-[calc(100svh-6rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/12 px-3 py-2 text-sm font-bold text-primary shadow-glow">
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
                href="/artista"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "border-white/16 bg-white/10 text-white hover:bg-white/16",
                )}
              >
                {visualCopy.artistLogin}
                <ArrowRight className="size-5" />
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
            <div className="grid max-w-xl grid-cols-3 gap-3">
              {visualCopy.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-white/10 bg-white/[0.06] p-3 backdrop-blur"
                >
                  <p className="text-2xl font-black">{metric.value}</p>
                  <p className="mt-1 text-xs font-semibold text-white/58">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel rounded-lg p-3 shadow-2xl">
              <div className="overflow-hidden rounded-md bg-[#070b14]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="size-3 rounded-full bg-[var(--haiti-red)]" />
                  <span className="size-3 rounded-full bg-accent" />
                  <span className="size-3 rounded-full bg-primary" />
                  <span className="ml-auto text-xs font-semibold text-white/54">
                    aumprodz.com
                  </span>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative aspect-video overflow-hidden rounded-md border border-white/10 bg-[#101624]">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.28),rgba(242,201,76,0.16)_42%,rgba(8,10,18,0.84))]" />
                    <div className="absolute left-4 top-4 rounded-md bg-primary px-2 py-1 text-xs font-black uppercase text-primary-foreground">
                      Mission Control
                    </div>
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-xl font-black">
                        {visualCopy.previewTitle}
                      </p>
                      <p className="mt-1 text-sm text-white/68">
                        {visualCopy.previewText}
                      </p>
                    </div>
                  </div>
                  <div className="grid content-between gap-3">
                    {visualCopy.previewCategories.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.08] px-3 py-3"
                      >
                        <span className="text-sm font-bold">{item}</span>
                        <span className="h-2 w-16 rounded-full bg-primary/80" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 px-5 py-4">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/76">
                    {visualCopy.previewTags.map((item) => (
                      <span key={item} className="rounded-md bg-white/10 px-3 py-2">
                        {item}
                      </span>
                    ))}
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
            {visualCopy.viewAll}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} locale={locale} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div className="space-y-5">
            <Badge className="w-fit" tone="info">
              Artist OS
            </Badge>
            <h2 className="text-3xl font-black tracking-normal sm:text-5xl">
              {visualCopy.artistTitle}
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              {visualCopy.artistText}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/artista/registro"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                {visualCopy.artistCta}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/login?next=%2Fartist"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                {visualCopy.artistLogin}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {artistFlow.map((step, index) => {
              const Icon = step.icon;

              return (
                <Card key={step.label}>
                  <CardHeader>
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle className="flex items-center justify-between gap-3">
                      {step.label}
                      <span className="text-sm text-muted-foreground">
                        0{index + 1}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
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

      <CTASection
        title={visualCopy.trustTitle}
        description={visualCopy.trustText}
        primaryHref="/servicios"
        primaryLabel={t(locale, "home.services")}
        secondaryHref="/contacto"
        secondaryLabel={t(locale, "nav.contact")}
      />
    </>
  );
}
