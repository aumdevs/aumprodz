import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomeCopy = {
  academyCta: string;
  academyText: string;
  academyTitle: string;
  aboutEyebrow: string;
  aboutText: string;
  aboutTitle: string;
  artistCta: string;
  artistText: string;
  artistTitle: string;
  heroLineOne: string;
  heroLineTwo: string;
  heroPrice: string;
  modelIntro: string;
  servicesCta: string;
  servicesText: string;
  servicesTitle: string;
  startCta: string;
  workTitle: string;
  youtubeCta: string;
  youtubeText: string;
  youtubeTitle: string;
};

const copyByLocale: Record<AppLocale, HomeCopy> = {
  ht: {
    academyCta: "Gade Aum Academy",
    academyText:
      "Aum Academy se espas kote kominote a aprann sou teknoloji, IA, YouTube ak kontni dijital pou sèlman 50 dola ameriken chak mwa.",
    academyTitle: "Aum Academy",
    aboutEyebrow: "Ki moun ki Aum?",
    aboutTitle: "Aum se Bendjy, kreyatè ki dèyè Aum Prodz.",
    aboutText:
      "Mwen espesyalize'm nan pwodiksyon kontni vizyèl, dijital, ak pwogramasyon aplikasyon pou android ak ios ak web.",
    artistCta: "Aum Artist",
    artistText:
      "Pou atis ki vle pibliye mizik yo sou Spotify, Apple Music, TikTok Music ak Instagram, epi mete pawòl chante yo tou.",
    artistTitle: "Travay ak atis",
    heroLineOne: "Rete konekte",
    heroLineTwo: "ak aum",
    heroPrice: "pou sèlman 50 dola ameriken chak mwa",
    modelIntro: "Aprann sou",
    servicesCta: "Gade sèvis yo",
    servicesText:
      "Aum ofri sipò pou YouTube, AdSense, sit web, imaj, videyo, kont ak pwojè dijital lè yon moun bezwen yon direksyon ki klè.",
    servicesTitle: "Sèvis ak akonpayman",
    startCta: "Aprann plis",
    workTitle: "Kisa Aum Prodz fè nan kominote ayisyèn nan?",
    youtubeCta: "Gade YouTube",
    youtubeText:
      "Sou YouTube, Aum pataje videyo sou teknoloji, lide, kilti, kreyasyon kontni ak sijè ki ka ede moun reflechi pi byen.",
    youtubeTitle: "Videyo ak refleksyon",
  },
  es: {
    academyCta: "Ver Aum Academy",
    academyText:
      "Aum Academy es el espacio donde la comunidad aprende sobre tecnología, IA, YouTube y contenido digital por tan solo 50 dólares al mes.",
    academyTitle: "Aum Academy",
    aboutEyebrow: "¿Quién es Aum?",
    aboutTitle: "Aum es Bendjy, el creador detrás de Aum Prodz.",
    aboutText:
      "Me especializo en la producción de contenido visual y digital, y en la programación de aplicaciones para Android, iOS y web.",
    artistCta: "Aum Artist",
    artistText:
      "Para artistas que quieren publicar su música en Spotify, Apple Music, TikTok Music e Instagram, y también subir sus letras.",
    artistTitle: "Trabajo con artistas",
    heroLineOne: "Mantente al día",
    heroLineTwo: "con aum",
    heroPrice: "por tan solo 50 dólares al mes",
    modelIntro: "Aprende sobre",
    servicesCta: "Ver servicios",
    servicesText:
      "Aum ofrece apoyo para YouTube, AdSense, páginas web, imagen, video, cuentas y proyectos digitales cuando alguien necesita una dirección clara.",
    servicesTitle: "Servicios y acompañamiento",
    startCta: "Saber más",
    workTitle: "¿Qué hace Aum Prodz en la comunidad haitiana?",
    youtubeCta: "Ver YouTube",
    youtubeText:
      "En YouTube, Aum comparte videos sobre tecnología, ideas, cultura, creación de contenido y temas que ayudan a pensar mejor.",
    youtubeTitle: "Videos y reflexión",
  },
  en: {
    academyCta: "View Aum Academy",
    academyText:
      "Aum Academy is where the community learns about technology, AI, YouTube and digital content for only 50 dollars a month.",
    academyTitle: "Aum Academy",
    aboutEyebrow: "Who is Aum?",
    aboutTitle: "Aum is Bendjy, the creator behind Aum Prodz.",
    aboutText:
      "I specialize in visual and digital content production, and in programming applications for Android, iOS and web.",
    artistCta: "Aum Artist",
    artistText:
      "For artists who want to publish their music on Spotify, Apple Music, TikTok Music and Instagram, and upload their lyrics too.",
    artistTitle: "Work with artists",
    heroLineOne: "Stay up to date",
    heroLineTwo: "with aum",
    heroPrice: "for only 50 dollars a month",
    modelIntro: "Learn about",
    servicesCta: "View services",
    servicesText:
      "Aum offers support for YouTube, AdSense, websites, image, video, accounts and digital projects when someone needs clear direction.",
    servicesTitle: "Services and guidance",
    startCta: "Learn more",
    workTitle: "What does Aum Prodz do in the Haitian community?",
    youtubeCta: "View YouTube",
    youtubeText:
      "On YouTube, Aum shares videos about technology, ideas, culture, content creation and subjects that help people think more clearly.",
    youtubeTitle: "Videos and reflection",
  },
  fr: {
    academyCta: "Voir Aum Academy",
    academyText:
      "Aum Academy est l'espace où la communauté apprend la technologie, l'IA, YouTube et le contenu digital pour seulement 50 dollars par mois.",
    academyTitle: "Aum Academy",
    aboutEyebrow: "Qui est Aum?",
    aboutTitle: "Aum est Bendjy, le créateur derrière Aum Prodz.",
    aboutText:
      "Je me spécialise dans la production de contenu visuel et digital, ainsi que dans la programmation d'applications pour Android, iOS et le web.",
    artistCta: "Aum Artist",
    artistText:
      "Pour les artistes qui veulent publier leur musique sur Spotify, Apple Music, TikTok Music et Instagram, et aussi ajouter leurs paroles.",
    artistTitle: "Travail avec les artistes",
    heroLineOne: "Restez à jour",
    heroLineTwo: "avec aum",
    heroPrice: "pour seulement 50 dollars par mois",
    modelIntro: "Apprenez sur",
    servicesCta: "Voir les services",
    servicesText:
      "Aum propose un accompagnement pour YouTube, AdSense, sites web, image, vidéo, comptes et projets digitaux quand une personne a besoin d'une direction claire.",
    servicesTitle: "Services et accompagnement",
    startCta: "En savoir plus",
    workTitle: "Que fait Aum Prodz dans la communauté haïtienne?",
    youtubeCta: "Voir YouTube",
    youtubeText:
      "Sur YouTube, Aum partage des vidéos sur la technologie, les idées, la culture, la création de contenu et des sujets qui aident à mieux réfléchir.",
    youtubeTitle: "Vidéos et réflexion",
  },
  pt: {
    academyCta: "Ver Aum Academy",
    academyText:
      "Aum Academy é o espaço onde a comunidade aprende sobre tecnologia, IA, YouTube e conteúdo digital por apenas 50 dólares por mês.",
    academyTitle: "Aum Academy",
    aboutEyebrow: "Quem é Aum?",
    aboutTitle: "Aum é Bendjy, o criador por trás da Aum Prodz.",
    aboutText:
      "Sou especializado na produção de conteúdo visual e digital, e na programação de aplicativos para Android, iOS e web.",
    artistCta: "Aum Artist",
    artistText:
      "Para artistas que querem publicar sua música no Spotify, Apple Music, TikTok Music e Instagram, e também enviar suas letras.",
    artistTitle: "Trabalho com artistas",
    heroLineOne: "Fique em dia",
    heroLineTwo: "com aum",
    heroPrice: "por apenas 50 dólares por mês",
    modelIntro: "Aprenda sobre",
    servicesCta: "Ver serviços",
    servicesText:
      "Aum oferece apoio para YouTube, AdSense, sites, imagem, vídeo, contas e projetos digitais quando alguém precisa de uma direção clara.",
    servicesTitle: "Serviços e acompanhamento",
    startCta: "Saber mais",
    workTitle: "O que Aum Prodz faz na comunidade haitiana?",
    youtubeCta: "Ver YouTube",
    youtubeText:
      "No YouTube, Aum compartilha vídeos sobre tecnologia, ideias, cultura, criação de conteúdo e temas que ajudam as pessoas a pensar melhor.",
    youtubeTitle: "Vídeos e reflexão",
  },
};

const modelPills = [
  { label: "Claude", icon: ClaudeLogo },
  { label: "Codex", icon: CodexLogo },
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

const mobileModelPills = [
  { label: "Codex", icon: CodexLogo, className: "col-span-3" },
  { label: "YouTube", icon: YouTubeLogo, className: "col-span-3" },
  { label: "TikTok", icon: TikTokLogo, className: "col-span-2" },
  { label: "Spotify", icon: SpotifyLogo, className: "col-span-2" },
  { label: "Claude", icon: ClaudeLogo, className: "col-span-2" },
  { label: "Instagram", icon: InstagramLogo, className: "col-span-3" },
  { label: "Tecnología", icon: TechnologyLogo, className: "col-span-3" },
  { label: "Gemini", icon: GeminiLogo, className: "col-span-2" },
  { label: "Kimi", icon: KimiLogo, className: "col-span-2" },
  { label: "Facebook", icon: FacebookLogo, className: "col-span-2" },
] as const;

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const copy = copyByLocale[locale] ?? copyByLocale.ht;

  return (
    <>
      <PublicEventTracker eventName="page_view" page="/" source="home" />

      <section className="flex min-h-[calc(100svh-5.5rem)] items-center py-6 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-12">
        <div className="public-shell flex flex-col items-center text-center">
          <div className="hero-logo-motion mb-4 flex size-20 items-center justify-center overflow-hidden bg-transparent sm:mb-7 sm:size-24">
            <Image
              src="/aum-prodz-logo-transparent.png"
              alt=""
              width={112}
              height={112}
              priority
              className="hero-logo-image h-full w-full object-contain"
            />
          </div>
          <h1 className="mammouth-title max-w-full whitespace-nowrap text-[clamp(1.55rem,4.4vw,3.7rem)]">
            {copy.heroLineOne} {copy.heroLineTwo}
          </h1>

          <div className="mt-5 w-full sm:hidden">
            <p className="text-lg font-semibold text-muted-foreground">
              {copy.modelIntro}
            </p>
            <div className="mx-auto mt-3 grid max-w-[22rem] grid-cols-6 gap-2.5">
              {mobileModelPills.map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    "mammouth-pill flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[0.7rem] font-black leading-tight text-foreground shadow-sm min-[390px]:gap-2 min-[390px]:text-[0.76rem]",
                    item.className,
                  )}
                >
                  <span className="inline-flex size-[1.05rem] shrink-0 items-center justify-center min-[390px]:size-5">
                    <item.icon className="size-[1.05rem] min-[390px]:size-5" />
                  </span>
                  <span className="min-w-0 whitespace-nowrap">{item.label}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 hidden max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-3 text-2xl font-medium text-muted-foreground sm:flex sm:text-3xl">
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
          <p className="mt-5 text-lg font-semibold leading-snug text-muted-foreground sm:mt-7 sm:text-2xl">
            {copy.heroPrice}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row">
            <Link href="#quien-es-aum" className={cn(buttonVariants({ size: "lg" }))}>
              {copy.startCta}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <AboutAumSection copy={copy} />

      <AumWorkSection copy={copy} />
    </>
  );
}

function AboutAumSection({ copy }: { copy: HomeCopy }) {
  return (
    <section id="quien-es-aum" className="public-section-tight scroll-mt-28">
      <div className="public-shell">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-primary">
              {copy.aboutEyebrow}
            </p>
            <h2 className="mammouth-title text-3xl leading-[1.02] sm:text-5xl">
              {copy.aboutTitle}
            </h2>
            <p className="mammouth-subtitle mt-5 text-lg leading-relaxed sm:text-xl">
              {copy.aboutText}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft">
            <Image
              src="/aum-prodz-about-recording.png"
              alt="AUM PRODZ recording podcast with laptop and microphone"
              width={1448}
              height={1086}
              className="aspect-[16/10] h-full w-full object-cover"
              sizes="(min-width: 1024px) 52vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AumWorkSection({ copy }: { copy: HomeCopy }) {
  const paths = [
    {
      cta: copy.youtubeCta,
      href: "/youtube",
      text: copy.youtubeText,
      title: copy.youtubeTitle,
    },
    {
      cta: copy.servicesCta,
      href: "/servicios",
      text: copy.servicesText,
      title: copy.servicesTitle,
    },
    {
      cta: copy.artistCta,
      href: "/artista",
      text: copy.artistText,
      title: copy.artistTitle,
    },
    {
      cta: copy.academyCta,
      href: "/contacto",
      text: copy.academyText,
      title: copy.academyTitle,
    },
  ];

  return (
    <section className="public-section-tight pt-0">
      <div className="public-shell">
        <div className="aum-question-panel mx-auto max-w-4xl text-center">
          <span aria-hidden="true" className="aum-question-mark">
            ?
          </span>
          <h2 className="mammouth-title text-3xl leading-[1.02] sm:text-5xl">
            {copy.workTitle}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paths.map((item) => (
            <article
              key={item.href}
              className="aum-offer-card flex min-h-72 flex-col items-center rounded-[2rem] border border-border bg-surface/78 p-6 text-center shadow-soft"
            >
              <h3 className="aum-offer-title text-xl font-black leading-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-base font-medium leading-relaxed text-muted-foreground">
                {item.text}
              </p>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "aum-offer-button mt-6",
                )}
              >
                {item.cta}
                <ArrowRight className="size-5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClaudeLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center text-[1.15rem] font-black leading-none text-[#d46d4c]",
        className,
      )}
    >
      ✳
    </span>
  );
}

function GeminiLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center text-[1.1rem] font-black leading-none text-[#3d8ef4]",
        className,
      )}
    >
      ✦
    </span>
  );
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
    <span className={cn("dark-visible-logo inline-flex items-center justify-center text-base font-black leading-none text-[#111111]", className)}>
      G
    </span>
  );
}

function DeepSeekLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center text-base font-black leading-none text-[#4d65ff]",
        className,
      )}
    >
      D
    </span>
  );
}

function KimiLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "dark-visible-logo inline-flex size-5 items-center justify-center text-base font-black leading-none text-[#111111]",
        className,
      )}
    >
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
    <svg className={cn("dark-visible-logo", className)} viewBox="0 0 24 24" aria-hidden="true">
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
        data-dark-visible-fill
        fill="#111"
        d="M15.1 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
      />
    </svg>
  );
}

function CodexLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("dark-visible-logo text-[#111111]", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.85"
      >
        <path d="M12 3.5c1.9 0 3.2 1.1 3.9 2.8" />
        <path d="M15.9 6.3c1.7-.2 3.2.6 4 2.1.9 1.6.6 3.2-.5 4.5" />
        <path d="M19.4 12.9c.8 1.6.5 3.3-.8 4.5-1.3 1.2-3 1.3-4.5.5" />
        <path d="M14.1 17.9c-.8 1.5-2.2 2.4-4 2.2-1.8-.2-3-1.3-3.6-3" />
        <path d="M6.5 17.1c-1.7.1-3.1-.8-3.9-2.4-.7-1.6-.3-3.2.9-4.4" />
        <path d="M3.5 10.3C2.8 8.7 3.2 7.1 4.6 6c1.4-1.1 3.1-1 4.5-.1" />
        <path d="M9.1 5.9 15 9.3v5.4l-5.9 3.4L4.2 15.3v-6l4.9-3.4Z" />
        <path d="M9.1 5.9v6.7L15 9.3" />
        <path d="M15 14.7 9.1 12.6v5.5" />
      </g>
    </svg>
  );
}
