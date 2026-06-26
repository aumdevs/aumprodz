import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicServiceBySlug,
  localServices,
} from "@/lib/content/services";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return localServices.map((service) => ({ slug: service.slug }));
}

const detailCopyByLocale: Record<
  AppLocale,
  {
    result: string;
    includes: string;
    process: string;
    requirements: string;
    summary: string;
    priceFrom: string;
    duration: string;
    whatsapp: string;
    allServices: string;
    backHome: string;
  }
> = {
  ht: {
    result: "Rezilta",
    includes: "Sa li gen ladan",
    process: "Pwosesis",
    requirements: "Sa mwen bezwen",
    summary: "Rezime",
    priceFrom: "Pri a kòmanse apati",
    duration: "Dire a kòmanse apati",
    whatsapp: "Pale ak Om",
    allServices: "Gade tout sèvis yo",
    backHome: "Retounen",
  },
  es: {
    result: "Resultado",
    includes: "Qué incluye",
    process: "Proceso",
    requirements: "Requisitos",
    summary: "Resumen",
    priceFrom: "Precio a partir de",
    duration: "Duración a partir de",
    whatsapp: "Hablar con Om",
    allServices: "Ver todos los servicios",
    backHome: "Volver",
  },
  en: {
    result: "Result",
    includes: "What is included",
    process: "Process",
    requirements: "Requirements",
    summary: "Summary",
    priceFrom: "Starting price",
    duration: "Estimated duration from",
    whatsapp: "Talk to Om",
    allServices: "View all services",
    backHome: "Back",
  },
  fr: {
    result: "Résultat",
    includes: "Ce qui est inclus",
    process: "Processus",
    requirements: "Conditions",
    summary: "Résumé",
    priceFrom: "Prix à partir de",
    duration: "Durée à partir de",
    whatsapp: "Parler avec Om",
    allServices: "Voir tous les services",
    backHome: "Retour",
  },
  pt: {
    result: "Resultado",
    includes: "O que inclui",
    process: "Processo",
    requirements: "Requisitos",
    summary: "Resumo",
    priceFrom: "Preço a partir de",
    duration: "Duração a partir de",
    whatsapp: "Falar com Om",
    allServices: "Ver todos os serviços",
    backHome: "Voltar",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const service = await getPublicServiceBySlug(slug, locale);

  return {
    title: service ? service.title : "Servicio",
    description: service?.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const service = await getPublicServiceBySlug(slug, locale);

  if (!service) {
    notFound();
  }

  const copy = detailCopyByLocale[locale] ?? detailCopyByLocale.ht;
  const Icon = service.icon;
  const pagePath = `/servicios/${service.slug}`;

  return (
    <article className="public-section-tight">
      <PublicEventTracker
        eventName="service_detail_view"
        page={pagePath}
        service={service.slug}
        source="service_detail"
      />
      <div className="public-shell grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
                <Icon className="size-7" />
              </span>
              <h1 className="mammouth-title text-4xl sm:text-5xl">
                {service.title}
              </h1>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {service.description}
            </p>
          </div>

          <section className="grid gap-5 md:grid-cols-3">
            {service.outcomes.map((outcome) => (
              <Card key={outcome} className="mammouth-card">
                <CardHeader>
                  <Sparkles className="size-5 text-primary" />
                  <CardTitle className="text-base">{copy.result}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {outcome}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <Card className="mammouth-card">
              <CardHeader>
                <CardTitle>{copy.includes}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.deliverables.map((deliverable) => (
                  <p key={deliverable} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {deliverable}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card className="mammouth-card">
              <CardHeader>
                <CardTitle>{copy.process}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.modules.map((module, index) => (
                  <p key={module} className="flex gap-3 text-sm leading-6">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold">
                      {index + 1}
                    </span>
                    {module}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5">
            <Card className="mammouth-card">
              <CardHeader>
                <ClipboardCheck className="size-6 text-primary" />
                <CardTitle>{copy.requirements}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.requirements.map((requirement) => (
                  <p key={requirement} className="text-sm leading-6 text-muted-foreground">
                    {requirement}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Card className="mammouth-card">
            <CardHeader>
              <CardTitle>{copy.summary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="mammouth-pill rounded-2xl p-3">
                  <p className="text-muted-foreground">{copy.priceFrom}</p>
                  <p className="mt-1 font-bold">{service.priceFrom}</p>
                </div>
                <div className="mammouth-pill rounded-2xl p-3">
                  <p className="text-muted-foreground">{copy.duration}</p>
                  <p className="mt-1 font-bold">{service.duration}</p>
                </div>
              </div>
              <WhatsappCtaLink
                service={service.slug}
                source="service_detail"
                placement="summary_cta"
                page={pagePath}
                label={copy.whatsapp}
                size="lg"
                className="w-full"
              />
              <Link
                href="/servicios"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-center",
                )}
              >
                {copy.allServices}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-center",
                )}
              >
                <ArrowLeft className="size-4" />
                {copy.backHome}
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}
