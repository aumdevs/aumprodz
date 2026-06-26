import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  Brush,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileText,
  Globe2,
  Image as ImageIcon,
  KeyRound,
  Lightbulb,
  MessageCircle,
  MonitorPlay,
  MousePointerClick,
  Palette,
  SearchCheck,
  Settings,
  ShieldCheck,
  Video,
  type LucideIcon,
} from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { buttonVariants } from "@/components/ui/button";
import { getPublicServices, type ServiceSlug } from "@/lib/content/services";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomeCopy = {
  artistCta: string;
  artistLogin: string;
  artistText: string;
  artistTitle: string;
  finalText: string;
  finalTitle: string;
  heroLineOne: string;
  heroLineTwo: string;
  heroPrice: string;
  modelIntro: string;
  serviceCta: string;
  serviceDetailCta: string;
  serviceText: string;
  serviceTitle: string;
  startCta: string;
  viewAll: string;
};

const copyByLocale: Record<AppLocale, HomeCopy> = {
  ht: {
    artistCta: "Kreye kont atis",
    artistLogin: "Mwen deja atis",
    artistText:
      "Pwofil, lansman, fichye, kontra, revizyon, pwomosyon ak sipò nan yon sèl espas pwofesyonèl.",
    artistTitle: "Karyè mizikal ou, òganize nan yon sèl kote.",
    finalText:
      "Mete chanèl ou, sit ou, imaj ou, kont ou oswa karyè atistik ou nan yon pwosesis ki klè.",
    finalTitle: "Pare pou mete pwojè dijital ou anba kontwòl?",
    heroLineOne: "Rete konekte",
    heroLineTwo: "ak aum",
    heroPrice: "pou sèlman senkant dola ameriken chak mwa",
    modelIntro: "Aprann sou",
    serviceText:
      "Om mete sèvis sa yo disponib pou kominote ayisyèn nan ki bezwen sipò dijital klè.",
    serviceTitle: "Sèvis disponib",
    serviceCta: "Pale ak Om",
    serviceDetailCta: "Gade detay",
    startCta: "Aprann plis",
    viewAll: "Gade tout",
  },
  es: {
    artistCta: "Crear cuenta de artista",
    artistLogin: "Ya soy artista",
    artistText:
      "Perfil, lanzamientos, archivos, contratos, revisión, promoción y soporte en un espacio profesional.",
    artistTitle: "Tu carrera musical organizada en un solo lugar.",
    finalText:
      "Pon tu canal, web, imagen, cuentas o carrera artística dentro de un proceso claro.",
    finalTitle: "¿Listo para poner tu proyecto digital bajo control?",
    heroLineOne: "Mantente al día",
    heroLineTwo: "con aum",
    heroPrice: "por tan solo 50 dólares al mes",
    modelIntro: "Aprende sobre",
    serviceText:
      "Om pone estos servicios a disposición de la comunidad haitiana que necesita apoyo digital claro.",
    serviceTitle: "Servicios disponibles",
    serviceCta: "Hablar con Om",
    serviceDetailCta: "Ver detalle",
    startCta: "Saber más",
    viewAll: "Ver todo",
  },
  en: {
    artistCta: "Create artist account",
    artistLogin: "I am already an artist",
    artistText:
      "Profiles, releases, files, contracts, review, promotion and support in one professional workspace.",
    artistTitle: "Your music career organized in one place.",
    finalText:
      "Bring your channel, website, image, accounts or artist career into a clear process.",
    finalTitle: "Ready to put your digital project under control?",
    heroLineOne: "Stay up to date",
    heroLineTwo: "with aum",
    heroPrice: "for only 50 dollars a month",
    modelIntro: "Learn about",
    serviceText:
      "Om makes these services available for the Haitian community that needs clear digital support.",
    serviceTitle: "Available services",
    serviceCta: "Talk to Om",
    serviceDetailCta: "View details",
    startCta: "Learn more",
    viewAll: "View all",
  },
  fr: {
    artistCta: "Créer un compte artiste",
    artistLogin: "Je suis déjà artiste",
    artistText:
      "Profil, sorties, fichiers, contrats, révision, promotion et support dans un espace professionnel.",
    artistTitle: "Votre carrière musicale organisée au même endroit.",
    finalText:
      "Mettez votre chaîne, site, image, comptes ou carrière artistique dans un processus clair.",
    finalTitle: "Prêt à mettre votre projet digital sous contrôle?",
    heroLineOne: "Restez à jour",
    heroLineTwo: "avec aum",
    heroPrice: "pour seulement 50 dollars par mois",
    modelIntro: "Apprenez sur",
    serviceText:
      "Om met ces services à disposition de la communauté haïtienne qui a besoin d'un soutien digital clair.",
    serviceTitle: "Services disponibles",
    serviceCta: "Parler avec Om",
    serviceDetailCta: "Voir le détail",
    startCta: "En savoir plus",
    viewAll: "Voir tout",
  },
  pt: {
    artistCta: "Criar conta de artista",
    artistLogin: "Já sou artista",
    artistText:
      "Perfil, lançamentos, arquivos, contratos, revisão, promoção e suporte em um espaço profissional.",
    artistTitle: "Sua carreira musical organizada em um só lugar.",
    finalText:
      "Coloque seu canal, site, imagem, contas ou carreira artística em um processo claro.",
    finalTitle: "Pronto para colocar seu projeto digital sob controle?",
    heroLineOne: "Fique em dia",
    heroLineTwo: "com aum",
    heroPrice: "por apenas 50 dólares por mês",
    modelIntro: "Aprenda sobre",
    serviceText:
      "Om disponibiliza estes serviços para a comunidade haitiana que precisa de apoio digital claro.",
    serviceTitle: "Serviços disponíveis",
    serviceCta: "Falar com Om",
    serviceDetailCta: "Ver detalhes",
    startCta: "Saber mais",
    viewAll: "Ver tudo",
  },
};

const modelPills = [
  { label: "Claude", icon: ClaudeLogo },
  { label: "GPT", icon: GptLogo },
  { label: "Gemini", icon: GeminiLogo },
  { label: "Spotify", icon: SpotifyLogo },
  { label: "Grok", icon: GrokLogo },
  { label: "DeepSeek", icon: DeepSeekLogo },
  { label: "Kimi", icon: KimiLogo },
  { label: "Apple Music", icon: AppleMusicLogo },
  { label: "YouTube", icon: YouTubeLogo },
  { label: "Instagram", icon: InstagramLogo },
  { label: "TikTok", icon: TikTokLogo },
  { label: "Facebook", icon: FacebookLogo },
  { label: "Tecnología", icon: TechnologyLogo },
] as const;

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const copy = copyByLocale[locale] ?? copyByLocale.ht;
  const [services, youtubeVideos] = await Promise.all([
    getPublicServices({ locale }),
    getPublicYoutubeVideos(3),
  ]);

  return (
    <>
      <PublicEventTracker eventName="page_view" page="/" source="home" />

      <section className="flex min-h-[calc(100svh-5.5rem)] items-center pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-12">
        <div className="public-shell flex flex-col items-center text-center">
          <div className="mb-7 flex size-[5.5rem] items-center justify-center overflow-hidden bg-transparent sm:size-24">
            <Image
              src="/aum-prodz-logo-transparent.png"
              alt=""
              width={112}
              height={112}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="mammouth-title max-w-full whitespace-nowrap text-[clamp(1.7rem,5.2vw,4.4rem)]">
            {copy.heroLineOne} {copy.heroLineTwo}
          </h1>
          <div className="mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-3 text-2xl font-medium text-muted-foreground sm:text-4xl">
            <span>{copy.modelIntro}</span>
            {modelPills.map((item) => (
              <span
                key={item.label}
                className="mammouth-pill inline-flex items-center gap-2 rounded-xl px-4 py-2 text-base font-bold text-foreground"
              >
                <span className="inline-flex size-5 shrink-0 items-center justify-center">
                  <item.icon className="size-5" />
                </span>
                {item.label}
              </span>
            ))}
          </div>
          <p className="mt-7 text-2xl font-medium text-muted-foreground sm:text-4xl">
            {copy.heroPrice}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/servicios" className={cn(buttonVariants({ size: "lg" }))}>
              {copy.startCta}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section-tight">
        <div className="public-shell">
          <SectionHeading title={copy.serviceTitle} text={copy.serviceText} />
          <ServicesAvailableBoard
            detailLabel={copy.serviceDetailCta}
            locale={locale}
            services={services}
          />
          <div className="mt-8 text-center">
            <WhatsappCtaLink
              service="youtube-adsense"
              source="home"
              placement="services_whatsapp"
              page="/"
              label={copy.serviceCta}
              size="lg"
            />
          </div>
        </div>
      </section>

      <YoutubeVideosSection videos={youtubeVideos} compact />
    </>
  );
}

function SectionHeading({ text, title }: { text: string; title: string }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h2 className="mammouth-title text-4xl sm:text-6xl">{title}</h2>
      <p className="mammouth-subtitle mt-4 text-xl sm:text-2xl">{text}</p>
    </div>
  );
}

function ClaudeLogo({ className }: { className?: string }) {
  return <span className={cn("text-xl font-black text-[#d46d4c]", className)}>✳</span>;
}

function GeminiLogo({ className }: { className?: string }) {
  return <span className={cn("text-xl font-black text-[#3d8ef4]", className)}>✦</span>;
}

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1db954" />
      <path
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M7.2 9.4c3.4-1 7.1-.7 9.8.9M8 12.1c2.8-.8 5.5-.5 7.7.8M8.8 14.7c2-.5 4-.3 5.6.5"
      />
    </svg>
  );
}

function GrokLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center justify-center text-base font-black leading-none text-[#111111]", className)}>
      G
    </span>
  );
}

function DeepSeekLogo({ className }: { className?: string }) {
  return <span className={cn("text-lg font-black text-[#4d65ff]", className)}>D</span>;
}

function KimiLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center justify-center text-base font-black leading-none text-[#111111]", className)}>
      K
    </span>
  );
}

function AppleMusicLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="apple-music-gradient" x1="4" x2="20" y1="20" y2="4">
          <stop stopColor="#ff2d55" />
          <stop offset="1" stopColor="#fa57c1" />
        </linearGradient>
      </defs>
      <rect width="18" height="18" x="3" y="3" rx="4.5" fill="url(#apple-music-gradient)" />
      <path
        fill="#fff"
        d="M15.7 6.7v8.1a2.3 2.3 0 1 1-1.1-2V9.5l-5.2 1v5.1a2.3 2.3 0 1 1-1.1-2V8.7l7.4-1.4Z"
      />
    </svg>
  );
}

function TechnologyLogo({ className }: { className?: string }) {
  return <Settings className={cn("text-primary", className)} />;
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877f2"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.24 0-1.63.78-1.63 1.57v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z"
      />
    </svg>
  );
}

function YouTubeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ff0033"
        d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9.1 2 12 2 12s0 2.9.4 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.9.4-4.8.4-4.8s0-2.9-.4-4.8Z"
      />
      <path fill="#fff" d="m10 15.5 5.2-3.5L10 8.5v7Z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="instagram-gradient" x1="2" x2="22" y1="22" y2="2">
          <stop stopColor="#feda75" />
          <stop offset=".35" stopColor="#fa7e1e" />
          <stop offset=".62" stopColor="#d62976" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect
        width="17"
        height="17"
        x="3.5"
        y="3.5"
        rx="5"
        fill="none"
        stroke="url(#instagram-gradient)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="url(#instagram-gradient)" strokeWidth="2" />
      <circle cx="16.9" cy="7.1" r="1.2" fill="#d62976" />
    </svg>
  );
}

function TikTokLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#25f4ee"
        d="M14.7 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
        opacity=".7"
      />
      <path
        fill="#fe2c55"
        d="M15.6 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
        opacity=".85"
      />
      <path
        fill="#111"
        d="M15.1 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
      />
    </svg>
  );
}

function GptLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="#111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        <path d="M12 3.2a3.3 3.3 0 0 1 5 2.8v1.2l1 .6a3.3 3.3 0 0 1 0 5.8l-1 .6v1.2a3.3 3.3 0 0 1-5 2.8l-1-.6-1 .6a3.3 3.3 0 0 1-5-2.8v-1.2l-1-.6a3.3 3.3 0 0 1 0-5.8l1-.6V6a3.3 3.3 0 0 1 5-2.8l1 .6 1-.6Z" />
        <path d="M8 7.4 12 5l4 2.4v4.7l-4 2.4-4-2.4V7.4Z" />
        <path d="M8 12.1 4.8 10M16 7.4l3.2 2.1M16 16.6v-4.5M8 16.6v-4.5M12 14.5v4" />
      </g>
    </svg>
  );
}

function ServicesAvailableBoard({
  detailLabel,
  locale,
  services,
}: {
  detailLabel: string;
  locale: AppLocale;
  services: Awaited<ReturnType<typeof getPublicServices>>;
}) {
  const columns = getHomeServiceColumns(locale);

  return (
    <div className="mx-auto mt-12 max-w-6xl">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ icon: ColumnIcon, slugs, title }) => {
          const columnServices = services.filter((service) =>
            (slugs as readonly ServiceSlug[]).includes(service.slug),
          );
          const service = columnServices[0];
          const rows = service ? getServiceRows(service) : [];

          return (
            <div
              key={title}
              className="flex h-full flex-col rounded-[2rem] border border-border bg-surface/70 p-5 shadow-soft"
            >
              <h3 className="mb-5 min-h-14 text-center text-xl font-black uppercase leading-tight text-muted-foreground">
                {title}
              </h3>
              {service ? (
                <div className="flex flex-1 flex-col gap-3">
                  {getHomeServiceRows(locale, service.slug, rows).map((row) => {
                    const RowIcon = getServiceRowIcon(row, ColumnIcon);

                    return (
                      <Link
                        key={`${service.slug}-${row}`}
                        href={`/servicios?servicio=${service.slug}`}
                        className="group flex min-h-20 items-center gap-4 rounded-3xl bg-card px-4 py-3 text-left shadow-[0_14px_30px_rgba(80,27,24,0.08)] transition-transform hover:-translate-y-0.5"
                      >
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background text-primary">
                          <RowIcon className="size-5" />
                        </span>
                        <span className="text-base font-black leading-tight text-foreground">
                          {row}
                        </span>
                      </Link>
                    );
                  })}
                  <Link
                    href={`/servicios?servicio=${service.slug}`}
                    className="mt-auto flex min-h-16 items-center justify-between gap-4 rounded-3xl bg-primary px-5 py-4 text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                  >
                    <span className="text-base font-black">
                      {detailLabel}
                    </span>
                    <ArrowRight className="size-5" />
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getHomeServiceColumns(locale: AppLocale) {
  const titles: Record<AppLocale, Record<ServiceSlug, string>> = {
    ht: {
      "youtube-adsense": "YouTube ak AdSense",
      "paginas-web": "Web ak aplikasyon",
      "imagen-video": "Imaj ak videyo",
      "cuentas-digitales": "Kont ak rezo",
    },
    es: {
      "youtube-adsense": "YouTube & AdSense",
      "paginas-web": "Web y aplicación",
      "imagen-video": "Imagen & Video",
      "cuentas-digitales": "Cuentas & Redes",
    },
    en: {
      "youtube-adsense": "YouTube & AdSense",
      "paginas-web": "Web & App",
      "imagen-video": "Image & Video",
      "cuentas-digitales": "Accounts & Social",
    },
    fr: {
      "youtube-adsense": "YouTube et AdSense",
      "paginas-web": "Web et application",
      "imagen-video": "Image et vidéo",
      "cuentas-digitales": "Comptes et réseaux",
    },
    pt: {
      "youtube-adsense": "YouTube e AdSense",
      "paginas-web": "Web e aplicativo",
      "imagen-video": "Imagem e vídeo",
      "cuentas-digitales": "Contas e redes",
    },
  };
  const copy = titles[locale] ?? titles.ht;

  return [
    {
      title: copy["youtube-adsense"],
      slugs: ["youtube-adsense"],
      icon: MonitorPlay,
    },
    {
      title: copy["paginas-web"],
      slugs: ["paginas-web"],
      icon: MessageCircle,
    },
    {
      title: copy["imagen-video"],
      slugs: ["imagen-video"],
      icon: Brush,
    },
    {
      title: copy["cuentas-digitales"],
      slugs: ["cuentas-digitales"],
      icon: KeyRound,
    },
  ] as const;
}

function getHomeServiceRows(
  locale: AppLocale,
  slug: ServiceSlug,
  fallbackRows: string[],
) {
  const rows: Record<AppLocale, Record<ServiceSlug, string[]>> = {
    ht: {
      "youtube-adsense": ["Oryantasyon", "Monetizasyon", "AdSense", "Revizyon chanèl"],
      "paginas-web": ["Web pwofesyonèl", "Aplikasyon senp", "Landing page", "Konvèsyon"],
      "imagen-video": ["Miniati", "Edit videyo", "Flyer", "Branding"],
      "cuentas-digitales": ["Kreyasyon kont", "Rekiperasyon", "Sekirite", "Rezo sosyal"],
    },
    es: {
      "youtube-adsense": ["Orientación", "Monetización", "AdSense", "Revisión de canal"],
      "paginas-web": ["Web profesional", "Aplicación simple", "Landing page", "Conversión"],
      "imagen-video": ["Miniatura", "Edición de video", "Flyer", "Branding"],
      "cuentas-digitales": ["Creación de cuentas", "Recuperación", "Seguridad", "Redes sociales"],
    },
    en: {
      "youtube-adsense": ["Guidance", "Monetization", "AdSense", "Channel review"],
      "paginas-web": ["Professional web", "Simple app", "Landing page", "Conversion"],
      "imagen-video": ["Thumbnail", "Video editing", "Flyer", "Branding"],
      "cuentas-digitales": ["Account setup", "Recovery", "Security", "Social platforms"],
    },
    fr: {
      "youtube-adsense": ["Orientation", "Monétisation", "AdSense", "Révision chaîne"],
      "paginas-web": ["Web professionnel", "Application simple", "Landing page", "Conversion"],
      "imagen-video": ["Miniature", "Montage vidéo", "Flyer", "Branding"],
      "cuentas-digitales": ["Création de comptes", "Récupération", "Sécurité", "Réseaux sociaux"],
    },
    pt: {
      "youtube-adsense": ["Orientação", "Monetização", "AdSense", "Revisão do canal"],
      "paginas-web": ["Web profissional", "Aplicativo simples", "Landing page", "Conversão"],
      "imagen-video": ["Miniatura", "Edição de vídeo", "Flyer", "Branding"],
      "cuentas-digitales": ["Criação de contas", "Recuperação", "Segurança", "Redes sociais"],
    },
  };

  return rows[locale]?.[slug] ?? fallbackRows.slice(0, 4);
}

function getServiceRows(
  service: Awaited<ReturnType<typeof getPublicServices>>[number],
) {
  const rows = [
    service.eyebrow,
    ...service.modules,
    ...service.deliverables,
    ...service.outcomes,
  ].filter(Boolean);

  return Array.from(new Set(rows)).slice(0, 5);
}

function getServiceRowIcon(row: string, fallback: LucideIcon): LucideIcon {
  const text = row.toLowerCase();

  if (hasAny(text, ["monetiz", "adsense", "dinero", "money", "paiement", "peman"])) {
    return BadgeDollarSign;
  }

  if (hasAny(text, ["diagn", "revis", "review", "révision", "revizyon", "estado", "case", "caso"])) {
    return SearchCheck;
  }

  if (hasAny(text, ["estrateg", "strategy", "estrateji", "stratég", "plan"])) {
    return Lightbulb;
  }

  if (hasAny(text, ["web", "site", "sit ", "landing", "ecommerce", "arquitect", "architecture"])) {
    return Globe2;
  }

  if (hasAny(text, ["conversion", "conversión", "conversao", "vender", "sell"])) {
    return MousePointerClick;
  }

  if (hasAny(text, ["video", "vídeo", "videyo", "reels"])) {
    return Video;
  }

  if (hasAny(text, ["imagen", "image", "imaj", "visual", "miniatura", "flyer"])) {
    return ImageIcon;
  }

  if (hasAny(text, ["diseño", "design", "branding", "contenido", "content", "kontni", "conteúdo"])) {
    return Palette;
  }

  if (hasAny(text, ["cuenta", "account", "kont", "compte", "acceso", "access", "aksè"])) {
    return KeyRound;
  }

  if (hasAny(text, ["seguridad", "security", "sécurité", "proteger", "protect"])) {
    return ShieldCheck;
  }

  if (hasAny(text, ["entrega", "delivery", "livraison", "livrezon", "publicar", "publishing"])) {
    return BadgeCheck;
  }

  if (hasAny(text, ["archivo", "file", "fichye", "document", "copy", "texto", "text"])) {
    return FileText;
  }

  if (hasAny(text, ["objetivo", "analytics", "données", "datos", "data"])) {
    return ChartNoAxesCombined;
  }

  if (hasAny(text, ["precio", "price", "costo", "cost"])) {
    return CircleDollarSign;
  }

  return fallback;
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}
