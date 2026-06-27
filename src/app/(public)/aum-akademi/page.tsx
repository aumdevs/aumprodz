import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aum Akademi",
  description:
    "Academia de AUM PRODZ para aprender tecnologia, IA, YouTube y contenido digital con Aum.",
};

type AkademiCopy = {
  badge: string;
  billingNote: string;
  cta: string;
  eyebrow: string;
  features: Array<{
    icon: typeof BookOpenCheck;
    title: string;
    text: string;
  }>;
  panelLabel: string;
  price: string;
  priceTitle: string;
  subtitle: string;
  title: string;
  topics: string[];
};

const akademiCopyByLocale: Record<AppLocale, AkademiCopy> = {
  ht: {
    badge: "Aum Akademi",
    billingNote: "Aksè a se chak mwa. Ou ka anile li nenpòt lè.",
    cta: "Kreye kont epi peye 50 dola chak mwa",
    eyebrow: "Akademi AUM PRODZ",
    features: [
      {
        icon: BookOpenCheck,
        title: "Kou Aum yo",
        text: "Aprann teknoloji, IA, YouTube, kontni dijital ak zouti pratik etap pa etap.",
      },
      {
        icon: CalendarDays,
        title: "Fòmasyon chak mwa",
        text: "Chak mwa gen sesyon pou poze kesyon, pratike epi konprann sa k ap chanje.",
      },
      {
        icon: UsersRound,
        title: "Kominote elèv",
        text: "Avanse ak lòt moun ki vle konprann, kreye epi grandi nan mond dijital la.",
      },
      {
        icon: Sparkles,
        title: "Dirèk ak Aum",
        text: "Aprann ak eksperyans reyèl Aum, ak egzanp ki pale ak kominote ayisyèn nan.",
      },
    ],
    panelLabel: "Panel akademi",
    price: "50 dola ameriken chak mwa",
    priceTitle: "Aksè mansyèl",
    subtitle:
      "Isit la ou ka aprann sou teknoloji, IA, YouTube, kontni dijital ak plis ankò ak Aum. Se yon espas pou konprann, pratike epi grandi ak kominote a.",
    title: "Byenveni nan panel akademi Aum.",
    topics: ["Teknoloji", "IA", "YouTube", "Kontni dijital", "Kominote"],
  },
  es: {
    badge: "Aum Akademi",
    billingNote: "Acceso mensual. Puedes cancelar cuando quieras.",
    cta: "Crear cuenta y pagar 50 dólares mensuales",
    eyebrow: "Academia AUM PRODZ",
    features: [
      {
        icon: BookOpenCheck,
        title: "Cursos de Aum",
        text: "Aprende tecnología, IA, YouTube, contenido digital y herramientas prácticas paso a paso.",
      },
      {
        icon: CalendarDays,
        title: "Formaciones mensuales",
        text: "Cada mes tendrás sesiones para preguntar, practicar y entender lo que está cambiando.",
      },
      {
        icon: UsersRound,
        title: "Comunidad de estudiantes",
        text: "Crece junto a personas que también quieren entender, crear y avanzar en internet.",
      },
      {
        icon: Sparkles,
        title: "Directo con Aum",
        text: "Aprende desde la experiencia real de Aum, con ejemplos claros para la comunidad haitiana.",
      },
    ],
    panelLabel: "Panel de academia",
    price: "50 dólares al mes",
    priceTitle: "Acceso mensual",
    subtitle:
      "Aquí puedes aprender sobre tecnología, IA, YouTube, contenido digital y más con Aum. Un espacio para entender, practicar y crecer con una comunidad de estudiantes.",
    title: "Bienvenido al panel de academia de Aum.",
    topics: ["Tecnología", "IA", "YouTube", "Contenido digital", "Comunidad"],
  },
  en: {
    badge: "Aum Akademi",
    billingNote: "Monthly access. You can cancel whenever you want.",
    cta: "Create account and pay 50 dollars monthly",
    eyebrow: "AUM PRODZ academy",
    features: [
      {
        icon: BookOpenCheck,
        title: "Aum courses",
        text: "Learn technology, AI, YouTube, digital content and practical tools step by step.",
      },
      {
        icon: CalendarDays,
        title: "Monthly trainings",
        text: "Every month you get sessions to ask questions, practice and understand what is changing.",
      },
      {
        icon: UsersRound,
        title: "Student community",
        text: "Grow with people who also want to understand, create and move forward online.",
      },
      {
        icon: Sparkles,
        title: "Directly with Aum",
        text: "Learn from Aum's real experience, with clear examples for the Haitian community.",
      },
    ],
    panelLabel: "Academy panel",
    price: "50 dollars a month",
    priceTitle: "Monthly access",
    subtitle:
      "Here you can learn about technology, AI, YouTube, digital content and more with Aum. A space to understand, practice and grow with a student community.",
    title: "Welcome to Aum's academy panel.",
    topics: ["Technology", "AI", "YouTube", "Digital content", "Community"],
  },
  fr: {
    badge: "Aum Akademi",
    billingNote: "Acces mensuel. Vous pouvez annuler quand vous voulez.",
    cta: "Creer un compte et payer 50 dollars par mois",
    eyebrow: "Academie AUM PRODZ",
    features: [
      {
        icon: BookOpenCheck,
        title: "Cours de Aum",
        text: "Apprenez la technologie, l'IA, YouTube, le contenu digital et des outils pratiques pas a pas.",
      },
      {
        icon: CalendarDays,
        title: "Formations mensuelles",
        text: "Chaque mois, des sessions pour poser des questions, pratiquer et comprendre ce qui change.",
      },
      {
        icon: UsersRound,
        title: "Communaute d'etudiants",
        text: "Progressez avec des personnes qui veulent comprendre, creer et avancer en ligne.",
      },
      {
        icon: Sparkles,
        title: "Directement avec Aum",
        text: "Apprenez depuis l'experience reelle de Aum, avec des exemples clairs pour la communaute haitienne.",
      },
    ],
    panelLabel: "Panel academie",
    price: "50 dollars par mois",
    priceTitle: "Acces mensuel",
    subtitle:
      "Ici, vous pouvez apprendre la technologie, l'IA, YouTube, le contenu digital et plus encore avec Aum. Un espace pour comprendre, pratiquer et grandir avec une communaute d'etudiants.",
    title: "Bienvenue dans le panel academie de Aum.",
    topics: ["Technologie", "IA", "YouTube", "Contenu digital", "Communaute"],
  },
  pt: {
    badge: "Aum Akademi",
    billingNote: "Acesso mensal. Voce pode cancelar quando quiser.",
    cta: "Criar conta e pagar 50 dolares mensais",
    eyebrow: "Academia AUM PRODZ",
    features: [
      {
        icon: BookOpenCheck,
        title: "Cursos da Aum",
        text: "Aprenda tecnologia, IA, YouTube, conteudo digital e ferramentas praticas passo a passo.",
      },
      {
        icon: CalendarDays,
        title: "Formacoes mensais",
        text: "Todo mes ha sessoes para perguntar, praticar e entender o que esta mudando.",
      },
      {
        icon: UsersRound,
        title: "Comunidade de estudantes",
        text: "Cresca com pessoas que tambem querem entender, criar e avancar na internet.",
      },
      {
        icon: Sparkles,
        title: "Direto com Aum",
        text: "Aprenda com a experiencia real da Aum, com exemplos claros para a comunidade haitiana.",
      },
    ],
    panelLabel: "Painel da academia",
    price: "50 dolares por mes",
    priceTitle: "Acesso mensal",
    subtitle:
      "Aqui voce pode aprender sobre tecnologia, IA, YouTube, conteudo digital e mais com Aum. Um espaco para entender, praticar e crescer com uma comunidade de estudantes.",
    title: "Bem-vindo ao painel da academia da Aum.",
    topics: ["Tecnologia", "IA", "YouTube", "Conteudo digital", "Comunidade"],
  },
};

export default async function AumAkademiPage() {
  const locale = await getCurrentLocale();
  const copy = akademiCopyByLocale[locale] ?? akademiCopyByLocale.ht;

  return (
    <section className="public-section-tight">
      <PublicEventTracker
        eventName="page_view"
        page="/aum-akademi"
        source="aum-akademi"
      />

      <div className="public-shell">
        <div className="grid items-center gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="max-w-3xl">
            <div className="mammouth-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-primary">
              <GraduationCap className="size-4" />
              {copy.badge}
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.32em] text-primary">
              {copy.eyebrow}
            </p>
            <h1 className="mammouth-title mt-4 text-4xl leading-[1.02] sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mammouth-subtitle mt-5 max-w-2xl text-lg leading-8 sm:text-xl">
              {copy.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {copy.topics.map((topic) => (
                <span
                  key={topic}
                  className="mammouth-pill rounded-full px-4 py-2 text-sm font-black text-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <aside className="mammouth-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">
                {copy.panelLabel}
              </p>
              <div className="mt-5 rounded-[1.5rem] border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CircleDollarSign className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">
                      {copy.priceTitle}
                    </p>
                    <p className="text-2xl font-black leading-tight text-foreground">
                      {copy.price}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-muted-foreground">
                  {copy.billingNote}
                </p>
              </div>

              <Link
                href="/contacto?servicio=aum-akademi"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-5 w-full justify-center",
                )}
              >
                {copy.cta}
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.features.map((feature) => (
            <article
              key={feature.title}
              className="aum-offer-card rounded-[2rem] border border-border bg-surface/78 p-5 shadow-soft"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <feature.icon className="size-6" />
              </div>
              <h2 className="mt-4 text-xl font-black leading-tight text-foreground">
                {feature.title}
              </h2>
              <p className="mt-3 text-base font-medium leading-7 text-muted-foreground">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
