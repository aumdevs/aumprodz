import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Brush,
  FileSignature,
  KeyRound,
  Megaphone,
  MessageCircle,
  MonitorPlay,
  Music2,
  ShieldCheck,
  UploadCloud,
  Zap,
} from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicServices, type ServiceSlug } from "@/lib/content/services";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";
import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dictionaries";
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
  processText: string;
  processTitle: string;
  planPrice: string;
  planTag: string;
  serviceText: string;
  serviceTitle: string;
  startCta: string;
  trustTitle: string;
  processCards: { text: string; title: string }[];
  trustCards: { text: string; title: string }[];
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
    heroLineOne: "Rete ajou",
    heroLineTwo: "ak AUM",
    heroPrice: "nan yon sèl kote pou sèlman 50 US$/mwa",
    modelIntro: "Aprann sou",
    processText:
      "Ou peye plan mwa a, ou mande sèvis ou bezwen pandan mwa sa a, epi AUM ede w bay priyorite travay la.",
    processTitle: "Kijan plan AUM lan mache.",
    planPrice: "Tout bagay pou 50 US$/mwa",
    planTag: "Ladan nan plan an",
    processCards: [
      { title: "Ou mande", text: "Ou ekri AUM epi ou eksplike sa ou bezwen pou pwojè a." },
      { title: "Nou bay priyorite", text: "Nou chwazi sa ki pi enpòtan pou mwa a selon objektif ou." },
      { title: "Nou egzekite", text: "Nou travay sou sèvis yo epi nou fè suivi ak livrezon klè." },
    ],
    serviceText:
      "YouTube, AdSense, imaj, videyo, web, kont dijital ak sipò òganize nan yon sèl plan mwa.",
    serviceTitle: "Sèvis disponib",
    startCta: "Pale ak AUM",
    trustTitle: "Done, aksè ak fichye yo dwe trete ak anpil swen.",
    trustCards: [
      { title: "Aksè kontwole", text: "Nou mande sèlman aksè ki nesesè pou sèvis la." },
      { title: "Fichye òganize", text: "Logo, foto, videyo ak dokiman rete klè pandan travay la." },
      { title: "Suivi senp", text: "Ou konnen sa k ap fèt, sa ki fini ak pwochen etap la." },
    ],
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
    heroLineOne: "Mantente al dia",
    heroLineTwo: "con AUM",
    heroPrice: "en un solo lugar por tan solo 50 US$/mes",
    modelIntro: "Aprende sobre",
    processText:
      "Pagas el plan mensual, pides lo que necesitas durante ese mes y AUM te ayuda a priorizar lo que más mueve tu proyecto.",
    processTitle: "Cómo funciona el plan AUM.",
    planPrice: "Todo por 50 US$/mes",
    planTag: "Incluido en el plan",
    processCards: [
      { title: "Pides", text: "Hablas con AUM y explicas qué necesitas para tu proyecto." },
      { title: "Priorizamos", text: "Ordenamos lo más importante del mes según tu objetivo." },
      { title: "Ejecutamos", text: "Trabajamos los servicios y damos seguimiento con entregas claras." },
    ],
    serviceText:
      "YouTube, AdSense, imagen, video, web, cuentas digitales y soporte en una sola membresía mensual.",
    serviceTitle: "Servicios disponibles",
    startCta: "Habla con AUM",
    trustTitle: "Datos, accesos y archivos tratados con cuidado.",
    trustCards: [
      { title: "Acceso controlado", text: "Solo se pide el acceso necesario para resolver el servicio." },
      { title: "Archivos ordenados", text: "Logo, fotos, videos y documentos se mantienen claros durante el trabajo." },
      { title: "Seguimiento simple", text: "Sabes qué se está haciendo, qué ya quedó listo y cuál es el próximo paso." },
    ],
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
    heroLineTwo: "with AUM",
    heroPrice: "in one place for only 50 US$/month",
    modelIntro: "Learn about",
    processText:
      "You pay the monthly plan, request what you need during that month and AUM helps prioritize the work that moves your project.",
    processTitle: "How the AUM plan works.",
    planPrice: "Everything for 50 US$/month",
    planTag: "Included in the plan",
    processCards: [
      { title: "Request", text: "You talk to AUM and explain what your project needs." },
      { title: "Prioritize", text: "We organize the most important work for the month." },
      { title: "Execute", text: "We work on the services and follow up with clear delivery." },
    ],
    serviceText:
      "YouTube, AdSense, image, video, web, digital accounts and support in one monthly membership.",
    serviceTitle: "Available services",
    startCta: "Talk to AUM",
    trustTitle: "Data, access and files handled with care.",
    trustCards: [
      { title: "Controlled access", text: "Only the access needed for the service is requested." },
      { title: "Organized files", text: "Logos, photos, videos and documents stay clear during the work." },
      { title: "Simple tracking", text: "You know what is being done, what is ready and what comes next." },
    ],
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
    heroLineTwo: "avec AUM",
    heroPrice: "au même endroit pour seulement 50 US$/mois",
    modelIntro: "Apprenez sur",
    processText:
      "Vous payez le plan mensuel, demandez ce dont vous avez besoin pendant le mois et AUM aide à prioriser le travail.",
    processTitle: "Comment fonctionne le plan AUM.",
    planPrice: "Tout pour 50 US$/mois",
    planTag: "Inclus dans le plan",
    processCards: [
      { title: "Demandez", text: "Vous parlez avec AUM et expliquez le besoin du projet." },
      { title: "Priorisez", text: "Nous organisons le plus important pour le mois." },
      { title: "Exécutez", text: "Nous travaillons les services avec un suivi clair." },
    ],
    serviceText:
      "YouTube, AdSense, image, vidéo, web, comptes digitaux et support dans un seul abonnement mensuel.",
    serviceTitle: "Services disponibles",
    startCta: "Parler avec AUM",
    trustTitle: "Données, accès et fichiers traités avec soin.",
    trustCards: [
      { title: "Accès contrôlé", text: "Nous demandons seulement l'accès nécessaire au service." },
      { title: "Fichiers organisés", text: "Logos, photos, vidéos et documents restent clairs pendant le travail." },
      { title: "Suivi simple", text: "Vous savez ce qui est en cours, terminé et la prochaine étape." },
    ],
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
    heroLineTwo: "com AUM",
    heroPrice: "em um só lugar por apenas 50 US$/mes",
    modelIntro: "Aprenda sobre",
    processText:
      "Você paga o plano mensal, pede o que precisa durante o mês e AUM ajuda a priorizar o que move seu projeto.",
    processTitle: "Como funciona o plano AUM.",
    planPrice: "Tudo por 50 US$/mes",
    planTag: "Incluído no plano",
    processCards: [
      { title: "Pede", text: "Você fala com AUM e explica o que o projeto precisa." },
      { title: "Priorizamos", text: "Organizamos o mais importante do mês conforme seu objetivo." },
      { title: "Executamos", text: "Trabalhamos os serviços com acompanhamento e entregas claras." },
    ],
    serviceText:
      "YouTube, AdSense, imagem, vídeo, web, contas digitais e suporte em uma única assinatura mensal.",
    serviceTitle: "Serviços disponíveis",
    startCta: "Falar com AUM",
    trustTitle: "Dados, acessos e arquivos tratados com cuidado.",
    trustCards: [
      { title: "Acesso controlado", text: "Só pedimos o acesso necessário para o serviço." },
      { title: "Arquivos organizados", text: "Logo, fotos, vídeos e documentos ficam claros durante o trabalho." },
      { title: "Acompanhamento simples", text: "Você sabe o que está em andamento, pronto e o próximo passo." },
    ],
    viewAll: "Ver tudo",
  },
};

const modelPills = [
  { label: "Claude", mark: "✳", tone: "text-[#d46d4c]" },
  { label: "GPT", mark: "◌", tone: "text-[#2f2f2f]" },
  { label: "Gemini", mark: "✦", tone: "text-[#3d8ef4]" },
  { label: "Mistral", mark: "M", tone: "text-[#e9572f]" },
  { label: "Grok", mark: "G", tone: "text-[#111111]" },
  { label: "DeepSeek", mark: "D", tone: "text-[#4d65ff]" },
  { label: "Kimi", mark: "K", tone: "text-[#111111]" },
  { label: "Perplexity", mark: "P", tone: "text-[#10a7b5]" },
  { label: "YouTube", mark: "▶", tone: "text-[#ff0033]" },
  { label: "Instagram", mark: "◎", tone: "text-[#d62976]" },
  { label: "TikTok", mark: "♪", tone: "text-[#111111]" },
  { label: "Recraft", mark: "R", tone: "text-[#111111]" },
  { label: "FLUX", mark: "F", tone: "text-[#171717]" },
] as const;

const processIcons = [MessageCircle, ShieldCheck, Zap] as const;
const trustIcons = [KeyRound, UploadCloud, ShieldCheck] as const;

const artistItems = [
  { icon: Music2, label: "Perfil", detail: "Datos, contacto e identidad." },
  { icon: UploadCloud, label: "Archivos", detail: "Audio, portada, letras y documentos." },
  { icon: FileSignature, label: "Contrato", detail: "Autorización y firma con claridad." },
  { icon: Megaphone, label: "Promoción", detail: "Lanzamiento con dirección." },
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

      <section className="public-section min-h-[calc(100svh-5rem)]">
        <div className="public-shell flex min-h-[calc(100svh-10rem)] flex-col items-center justify-center text-center">
          <div className="mb-7 flex size-24 items-center justify-center overflow-hidden bg-transparent">
            <Image
              src="/aum-prodz-logo.png"
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
                <span className={cn("text-lg font-black", item.tone)}>
                  {item.mark}
                </span>
                {item.label}
              </span>
            ))}
          </div>
          <p className="mt-7 text-3xl font-medium text-muted-foreground sm:text-5xl">
            {copy.heroPrice}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <WhatsappCtaLink
              service="youtube-adsense"
              source="home"
              placement="hero_whatsapp"
              page="/"
              label={copy.startCta}
              size="lg"
            />
          </div>
        </div>
      </section>

      <section className="public-section-tight">
        <div className="public-shell">
          <SectionHeading title={copy.serviceTitle} text={copy.serviceText} />
          <ServicesAvailableBoard copy={copy} services={services} />
          <div className="mt-8 text-center">
            <Link
              href="/servicios"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              {copy.viewAll}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section-tight">
        <div className="public-shell">
          <SectionHeading title={copy.processTitle} text={copy.processText} />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {copy.processCards.map(({ text, title }, index) => {
              const Icon = processIcons[index] ?? Zap;

              return (
              <Card key={title} className="mammouth-card text-center">
                <CardHeader>
                  <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-7" />
                  </span>
                  <CardTitle className="text-2xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section-tight">
        <div className="public-shell grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
              Artist OS
            </p>
            <h2 className="mammouth-title text-4xl sm:text-6xl">
              {copy.artistTitle}
            </h2>
            <p className="mammouth-subtitle text-xl">{copy.artistText}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/artista/registro"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                {copy.artistCta}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/login?next=%2Fartist"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                {copy.artistLogin}
              </Link>
            </div>
          </div>
          <div className="mammouth-card rounded-3xl p-4 sm:p-6">
            <div className="grid gap-3">
              {artistItems.map(({ detail, icon: Icon, label }, index) => (
                <div
                  key={label}
                  className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-[52px_1fr_auto] sm:items-center"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-black">{label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                  </div>
                  <span className="text-sm font-black text-primary">0{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section-tight">
        <div className="public-shell">
          <SectionHeading title="AUM Studio" text={copy.trustTitle} />
          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <Image
              src="/aum-prodz-podcast-hero.png"
              alt="AUM PRODZ podcast recording studio with microphone and laptop"
              width={1672}
              height={941}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-3">
            {copy.trustCards.map(({ text, title }, index) => {
              const Icon = trustIcons[index] ?? ShieldCheck;

              return (
                <div key={title} className="mammouth-card rounded-3xl p-5">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <YoutubeVideosSection videos={youtubeVideos} compact />

      <section className="public-section-tight">
        <div className="public-shell text-center">
          <h2 className="mammouth-title mx-auto max-w-4xl text-4xl sm:text-6xl">
            {copy.finalTitle}
          </h2>
          <p className="mammouth-subtitle mx-auto mt-5 max-w-2xl text-xl">
            {copy.finalText}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <WhatsappCtaLink
              service="youtube-adsense"
              source="home"
              placement="final_whatsapp"
              page="/"
              label={t(locale, "home.whatsapp")}
              size="lg"
            />
            <Link
              href="/servicios"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
            >
              {copy.viewAll}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
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

function ServicesAvailableBoard({
  copy,
  services,
}: {
  copy: HomeCopy;
  services: Awaited<ReturnType<typeof getPublicServices>>;
}) {
  const columns = [
    {
      title: "YouTube & AdSense",
      slugs: ["youtube-adsense"],
      icon: MonitorPlay,
    },
    {
      title: "Texto / Web",
      slugs: ["paginas-web"],
      icon: MessageCircle,
    },
    {
      title: "Imagen & Video",
      slugs: ["imagen-video"],
      icon: Brush,
    },
    {
      title: "Cuentas & Redes",
      slugs: ["cuentas-digitales"],
      icon: KeyRound,
    },
  ] as const;

  return (
    <div className="mx-auto mt-12 max-w-5xl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map(({ icon: ColumnIcon, slugs, title }) => {
          const columnServices = services.filter((service) =>
            (slugs as readonly ServiceSlug[]).includes(service.slug),
          );
          const service = columnServices[0];

          return (
            <div key={title} className="mammouth-card rounded-3xl p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <ColumnIcon className="size-5" />
                </span>
                <h3 className="text-sm font-black uppercase text-muted-foreground">
                  {title}
                </h3>
              </div>
              {service ? (
                <Link
                  href={`/servicios/${service.slug}`}
                  className="group block text-left"
                >
                  <p className="text-xl font-black text-foreground">
                    {service.title}
                  </p>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-muted-foreground">
                    {service.summary}
                  </p>
                  <span className="mt-5 inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                    {copy.planTag}
                  </span>
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mx-auto mt-6 flex max-w-xl flex-col items-center">
        <div className="h-12 w-px bg-border" />
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
          <ArrowDown className="size-5" />
        </div>
      </div>
      <div className="mx-auto mt-4 w-fit rounded-3xl border border-border bg-card px-8 py-5 text-center shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
          AUM PRODZ
        </p>
        <p className="mt-2 text-3xl font-black text-foreground">{copy.planPrice}</p>
      </div>
    </div>
  );
}
