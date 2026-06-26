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
  workEyebrow: string;
  workText: string;
  workTitle: string;
  youtubeCta: string;
  youtubeText: string;
  youtubeTitle: string;
};

const copyByLocale: Record<AppLocale, HomeCopy> = {
  ht: {
    academyCta: "Gade AUM Academy",
    academyText:
      "AUM Academy se espas kote moun aprann sou teknoloji, IA, YouTube, kontni ak zouti dijital pou 50 dola ameriken chak mwa.",
    academyTitle: "AUM Academy",
    aboutEyebrow: "Ki moun ki AUM?",
    aboutTitle: "AUM se Bendjy, kreyatè ki dèyè AUM PRODZ.",
    aboutText:
      "Mwen kreye videyo, eksperyans dijital ak sèvis pratik pou ede kominote ayisyèn nan konprann teknoloji, kontni, YouTube, mizik ak biznis sou entènèt ak plis klè.",
    artistCta: "AUM Artist",
    artistText:
      "Pou atis yo, AUM ap bati yon espas kote pwofil, fichye, lansman ak pwomosyon ka gen plis lòd.",
    artistTitle: "Travay ak atis",
    heroLineOne: "Rete konekte",
    heroLineTwo: "ak aum",
    heroPrice: "pou sèlman 50 dola ameriken chak mwa",
    modelIntro: "Aprann sou",
    servicesCta: "Gade sèvis yo",
    servicesText:
      "AUM ofri sipò pou YouTube, AdSense, sit web, imaj, videyo, kont ak pwojè dijital lè yon moun bezwen yon direksyon ki klè.",
    servicesTitle: "Sèvis ak akonpayman",
    startCta: "Aprann plis",
    workEyebrow: "Sa AUM fè",
    workText:
      "Home la se pou moun konprann kiyès AUM ye anvan yo antre nan sèvis, videyo oswa espas atis la.",
    workTitle: "Kontni, sèvis ak zouti pou moun ki vle avanse sou entènèt.",
    youtubeCta: "Gade YouTube",
    youtubeText:
      "Sou YouTube, AUM pataje videyo sou teknoloji, lide, kilti, kreyasyon kontni ak sijè ki ka ede moun reflechi pi byen.",
    youtubeTitle: "Videyo ak refleksyon",
  },
  es: {
    academyCta: "Ver AUM Academy",
    academyText:
      "AUM Academy será el espacio para aprender sobre tecnología, IA, YouTube, contenido y herramientas digitales por 50 dólares al mes.",
    academyTitle: "AUM Academy",
    aboutEyebrow: "¿Quién es AUM?",
    aboutTitle: "AUM es Bendjy, el creador detrás de AUM PRODZ.",
    aboutText:
      "Creo videos, experiencias digitales y servicios prácticos para ayudar a la comunidad haitiana a entender mejor la tecnología, el contenido, YouTube, la música y los negocios en internet.",
    artistCta: "AUM Artist",
    artistText:
      "Para artistas, AUM está construyendo un espacio donde perfil, archivos, lanzamientos y promoción tengan más orden.",
    artistTitle: "Trabajo con artistas",
    heroLineOne: "Mantente al día",
    heroLineTwo: "con aum",
    heroPrice: "por tan solo 50 dólares al mes",
    modelIntro: "Aprende sobre",
    servicesCta: "Ver servicios",
    servicesText:
      "AUM ofrece apoyo para YouTube, AdSense, páginas web, imagen, video, cuentas y proyectos digitales cuando alguien necesita una dirección clara.",
    servicesTitle: "Servicios y acompañamiento",
    startCta: "Saber más",
    workEyebrow: "Qué hace AUM",
    workText:
      "El home existe para que la persona entienda quién es AUM antes de entrar a servicios, videos o al espacio de artistas.",
    workTitle: "Contenido, servicios y herramientas para avanzar en internet.",
    youtubeCta: "Ver YouTube",
    youtubeText:
      "En YouTube, AUM comparte videos sobre tecnología, ideas, cultura, creación de contenido y temas que ayudan a pensar mejor.",
    youtubeTitle: "Videos y reflexión",
  },
  en: {
    academyCta: "View AUM Academy",
    academyText:
      "AUM Academy will be the space to learn about technology, AI, YouTube, content and digital tools for 50 dollars a month.",
    academyTitle: "AUM Academy",
    aboutEyebrow: "Who is AUM?",
    aboutTitle: "AUM is Bendjy, the creator behind AUM PRODZ.",
    aboutText:
      "I create videos, digital experiences and practical services to help the Haitian community understand technology, content, YouTube, music and online business with more clarity.",
    artistCta: "AUM Artist",
    artistText:
      "For artists, AUM is building a space where profiles, files, releases and promotion can stay more organized.",
    artistTitle: "Work with artists",
    heroLineOne: "Stay up to date",
    heroLineTwo: "with aum",
    heroPrice: "for only 50 dollars a month",
    modelIntro: "Learn about",
    servicesCta: "View services",
    servicesText:
      "AUM offers support for YouTube, AdSense, websites, image, video, accounts and digital projects when someone needs clear direction.",
    servicesTitle: "Services and guidance",
    startCta: "Learn more",
    workEyebrow: "What AUM does",
    workText:
      "The home page is here so people understand who AUM is before entering services, videos or the artist space.",
    workTitle: "Content, services and tools for people moving forward online.",
    youtubeCta: "View YouTube",
    youtubeText:
      "On YouTube, AUM shares videos about technology, ideas, culture, content creation and subjects that help people think more clearly.",
    youtubeTitle: "Videos and reflection",
  },
  fr: {
    academyCta: "Voir AUM Academy",
    academyText:
      "AUM Academy sera l'espace pour apprendre la technologie, l'IA, YouTube, le contenu et les outils digitaux pour 50 dollars par mois.",
    academyTitle: "AUM Academy",
    aboutEyebrow: "Qui est AUM?",
    aboutTitle: "AUM est Bendjy, le créateur derrière AUM PRODZ.",
    aboutText:
      "Je crée des vidéos, des expériences digitales et des services pratiques pour aider la communauté haïtienne à mieux comprendre la technologie, le contenu, YouTube, la musique et les projets en ligne.",
    artistCta: "AUM Artist",
    artistText:
      "Pour les artistes, AUM construit un espace où profil, fichiers, sorties et promotion peuvent être mieux organisés.",
    artistTitle: "Travail avec les artistes",
    heroLineOne: "Restez à jour",
    heroLineTwo: "avec aum",
    heroPrice: "pour seulement 50 dollars par mois",
    modelIntro: "Apprenez sur",
    servicesCta: "Voir les services",
    servicesText:
      "AUM propose un accompagnement pour YouTube, AdSense, sites web, image, vidéo, comptes et projets digitaux quand une personne a besoin d'une direction claire.",
    servicesTitle: "Services et accompagnement",
    startCta: "En savoir plus",
    workEyebrow: "Ce que fait AUM",
    workText:
      "La page d'accueil sert à comprendre qui est AUM avant d'entrer dans les services, les vidéos ou l'espace artiste.",
    workTitle: "Contenu, services et outils pour avancer en ligne.",
    youtubeCta: "Voir YouTube",
    youtubeText:
      "Sur YouTube, AUM partage des vidéos sur la technologie, les idées, la culture, la création de contenu et des sujets qui aident à mieux réfléchir.",
    youtubeTitle: "Vidéos et réflexion",
  },
  pt: {
    academyCta: "Ver AUM Academy",
    academyText:
      "AUM Academy será o espaço para aprender sobre tecnologia, IA, YouTube, conteúdo e ferramentas digitais por 50 dólares por mês.",
    academyTitle: "AUM Academy",
    aboutEyebrow: "Quem é AUM?",
    aboutTitle: "AUM é Bendjy, o criador por trás da AUM PRODZ.",
    aboutText:
      "Eu crio vídeos, experiências digitais e serviços práticos para ajudar a comunidade haitiana a entender melhor tecnologia, conteúdo, YouTube, música e projetos online.",
    artistCta: "AUM Artist",
    artistText:
      "Para artistas, AUM está construindo um espaço onde perfil, arquivos, lançamentos e promoção tenham mais organização.",
    artistTitle: "Trabalho com artistas",
    heroLineOne: "Fique em dia",
    heroLineTwo: "com aum",
    heroPrice: "por apenas 50 dólares por mês",
    modelIntro: "Aprenda sobre",
    servicesCta: "Ver serviços",
    servicesText:
      "AUM oferece apoio para YouTube, AdSense, sites, imagem, vídeo, contas e projetos digitais quando alguém precisa de uma direção clara.",
    servicesTitle: "Serviços e acompanhamento",
    startCta: "Saber mais",
    workEyebrow: "O que AUM faz",
    workText:
      "A home existe para que a pessoa entenda quem é AUM antes de entrar nos serviços, vídeos ou espaço de artistas.",
    workTitle: "Conteúdo, serviços e ferramentas para avançar na internet.",
    youtubeCta: "Ver YouTube",
    youtubeText:
      "No YouTube, AUM compartilha vídeos sobre tecnologia, ideias, cultura, criação de conteúdo e temas que ajudam as pessoas a pensar melhor.",
    youtubeTitle: "Vídeos e reflexão",
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
            <h2 className="mammouth-title text-4xl leading-[0.98] sm:text-6xl">
              {copy.aboutTitle}
            </h2>
            <p className="mammouth-subtitle mt-6 text-xl leading-relaxed sm:text-2xl">
              {copy.aboutText}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft">
            <Image
              src="/aum-prodz-studio-about.png"
              alt="AUM PRODZ podcast recording studio with laptop and camera"
              width={1536}
              height={864}
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
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-primary">
            {copy.workEyebrow}
          </p>
          <h2 className="mammouth-title text-4xl leading-[0.98] sm:text-6xl">
            {copy.workTitle}
          </h2>
          <p className="mammouth-subtitle mt-6 text-xl leading-relaxed sm:text-2xl">
            {copy.workText}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paths.map((item) => (
            <article
              key={item.href}
              className="flex min-h-72 flex-col rounded-[2rem] border border-border bg-surface/78 p-6 shadow-soft"
            >
              <h3 className="text-2xl font-black leading-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-lg font-medium leading-relaxed text-muted-foreground">
                {item.text}
              </p>
              <Link
                href={item.href}
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-6")}
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
