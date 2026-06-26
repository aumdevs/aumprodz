import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brush,
  KeyRound,
  MessageCircle,
  MonitorPlay,
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
  serviceCta: string;
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
      "Nou pale sou objektif la, nou verifye reyalite a, epi nou mete sèvis la nan etap ki klè.",
    processTitle: "Kijan travay la fèt.",
    processCards: [
      { title: "Ou mande", text: "Ou ekri AUM epi ou eksplike sa ou bezwen pou pwojè a." },
      { title: "Nou bay priyorite", text: "Nou chwazi sa ki pi enpòtan pou mwa a selon objektif ou." },
      { title: "Nou egzekite", text: "Nou travay sou sèvis yo epi nou fè suivi ak livrezon klè." },
    ],
    serviceText:
      "Chak sèvis gen pwòp pri ak pwòp etap li. Chwazi sa ou bezwen epi pale ak AUM pou kòmanse.",
    serviceTitle: "Sèvis disponib",
    serviceCta: "Pale ak AUM",
    startCta: "Aprann plis",
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
    heroLineOne: "Mantente al día",
    heroLineTwo: "con AUM",
    heroPrice: "en un solo lugar por tan solo 50 US$/mes",
    modelIntro: "Aprende sobre",
    processText:
      "Hablamos del objetivo, revisamos la realidad y convertimos el servicio en pasos claros.",
    processTitle: "Cómo funciona el trabajo.",
    processCards: [
      { title: "Pides", text: "Hablas con AUM y explicas qué necesitas para tu proyecto." },
      { title: "Priorizamos", text: "Ordenamos lo más importante del mes según tu objetivo." },
      { title: "Ejecutamos", text: "Trabajamos los servicios y damos seguimiento con entregas claras." },
    ],
    serviceText:
      "Cada servicio mantiene su precio normal y su propio alcance. Elige lo que necesitas y habla con AUM para empezar.",
    serviceTitle: "Servicios disponibles",
    serviceCta: "Hablar con AUM",
    startCta: "Saber más",
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
      "We talk about the goal, review the real situation and turn the service into clear steps.",
    processTitle: "How the work happens.",
    processCards: [
      { title: "Request", text: "You talk to AUM and explain what your project needs." },
      { title: "Prioritize", text: "We organize the most important work for the month." },
      { title: "Execute", text: "We work on the services and follow up with clear delivery." },
    ],
    serviceText:
      "Each service keeps its own price and scope. Choose what you need and talk to AUM to start.",
    serviceTitle: "Available services",
    serviceCta: "Talk to AUM",
    startCta: "Learn more",
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
      "Nous parlons de l'objectif, vérifions la réalité et transformons le service en étapes claires.",
    processTitle: "Comment le travail se fait.",
    processCards: [
      { title: "Demandez", text: "Vous parlez avec AUM et expliquez le besoin du projet." },
      { title: "Priorisez", text: "Nous organisons le plus important pour le mois." },
      { title: "Exécutez", text: "Nous travaillons les services avec un suivi clair." },
    ],
    serviceText:
      "Chaque service garde son propre prix et son propre périmètre. Choisissez ce dont vous avez besoin et parlez avec AUM.",
    serviceTitle: "Services disponibles",
    serviceCta: "Parler avec AUM",
    startCta: "En savoir plus",
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
      "Falamos sobre o objetivo, revisamos a realidade e transformamos o serviço em passos claros.",
    processTitle: "Como o trabalho acontece.",
    processCards: [
      { title: "Pede", text: "Você fala com AUM e explica o que o projeto precisa." },
      { title: "Priorizamos", text: "Organizamos o mais importante do mês conforme seu objetivo." },
      { title: "Executamos", text: "Trabalhamos os serviços com acompanhamento e entregas claras." },
    ],
    serviceText:
      "Cada serviço mantém seu preço normal e seu próprio escopo. Escolha o que precisa e fale com AUM para começar.",
    serviceTitle: "Serviços disponíveis",
    serviceCta: "Falar com AUM",
    startCta: "Saber mais",
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

      <section className="pb-20 pt-[3.5rem] sm:pt-[4.5rem] lg:pt-20">
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
          <ServicesAvailableBoard locale={locale} services={services} />
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
  locale,
  services,
}: {
  locale: AppLocale;
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
              className="rounded-[2rem] border border-border bg-surface/70 p-5 shadow-soft"
            >
              <h3 className="mb-5 text-center text-xl font-black uppercase text-muted-foreground">
                {title}
              </h3>
              {service ? (
                <div className="grid gap-3">
                  {rows.map((row) => (
                    <Link
                      key={`${service.slug}-${row}`}
                      href={`/servicios/${service.slug}`}
                      className="group flex min-h-20 items-center gap-4 rounded-3xl bg-card px-4 py-3 text-left shadow-[0_14px_30px_rgba(80,27,24,0.08)] transition-transform hover:-translate-y-0.5"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background text-primary">
                        <ColumnIcon className="size-5" />
                      </span>
                      <span className="text-base font-black leading-tight text-foreground">
                        {row}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href={`/servicios/${service.slug}`}
                    className="mt-1 flex min-h-20 items-center justify-between gap-4 rounded-3xl bg-primary px-5 py-4 text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                  >
                    <span>
                      <span className="block text-sm font-black uppercase">
                        {t(locale, "common.from")}
                      </span>
                      <span className="mt-1 block text-2xl font-black">
                        {service.priceFrom}
                      </span>
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
