import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { buttonVariants } from "@/components/ui/button";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomeCopy = {
  aboutEyebrow: string;
  aboutText: string;
  aboutTitle: string;
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
  startCta: string;
};

const copyByLocale: Record<AppLocale, HomeCopy> = {
  ht: {
    aboutEyebrow: "Byenveni",
    aboutTitle: "Byenveni sou paj aum",
    aboutText:
      "Mwen se om, moun ki dèyè AUM PRODZ. Isit la mwen pataje eksperyans, zouti ak direksyon pou kominote ayisyèn nan grandi ak plis konfyans nan kontni, teknoloji, mizik, YouTube ak pwojè dijital.",
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
    startCta: "Aprann plis",
  },
  es: {
    aboutEyebrow: "Bienvenido",
    aboutTitle: "Bienvenido a la página de aum",
    aboutText:
      "Soy om, la persona detrás de AUM PRODZ. Aquí comparto experiencia, herramientas y dirección para que la comunidad haitiana avance con más claridad en contenido, tecnología, música, YouTube y proyectos digitales.",
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
    startCta: "Saber más",
  },
  en: {
    aboutEyebrow: "Welcome",
    aboutTitle: "Welcome to the aum page",
    aboutText:
      "I am om, the person behind AUM PRODZ. This space shares experience, tools and direction for the Haitian community to move forward with more clarity in content, technology, music, YouTube and digital projects.",
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
    startCta: "Learn more",
  },
  fr: {
    aboutEyebrow: "Bienvenue",
    aboutTitle: "Bienvenue sur la page aum",
    aboutText:
      "Je suis om, la personne derrière AUM PRODZ. Ici, je partage de l'expérience, des outils et une direction pour aider la communauté haïtienne à avancer avec plus de clarté dans le contenu, la technologie, la musique, YouTube et les projets digitaux.",
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
    startCta: "En savoir plus",
  },
  pt: {
    aboutEyebrow: "Bem-vindo",
    aboutTitle: "Bem-vindo à página da aum",
    aboutText:
      "Eu sou om, a pessoa por trás da AUM PRODZ. Aqui compartilho experiência, ferramentas e direção para a comunidade haitiana avançar com mais clareza em conteúdo, tecnologia, música, YouTube e projetos digitais.",
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
    startCta: "Saber mais",
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
  const youtubeVideos = await getPublicYoutubeVideos(3);

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

      <AboutAumSection copy={copy} />

      <YoutubeVideosSection videos={youtubeVideos} compact />
    </>
  );
}

function AboutAumSection({ copy }: { copy: HomeCopy }) {
  return (
    <section className="public-section-tight">
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
