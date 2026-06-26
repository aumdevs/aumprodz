"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Brush,
  CheckCircle2,
  Clock3,
  Globe2,
  KeyRound,
  MessageCircle,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { ServiceCategory, ServiceSlug } from "@/lib/content/services";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type ServiceBrowserItem = {
  slug: ServiceSlug;
  category: ServiceCategory;
  label: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  priceFrom: string;
  duration: string;
  outcomes: string[];
  deliverables: string[];
  modules: string[];
  requirements: string[];
  packages: {
    title: string;
    description: string;
    priceLabel: string;
    duration: string;
    features: string[];
  }[];
  ctas: {
    label: string;
    placement: string;
    whatsappMessage: string;
  }[];
  media: {
    mediaType: string;
    title: string;
    url: string;
    altText: string;
  }[];
  whatsappMessage: string;
};

const icons: Record<ServiceSlug, LucideIcon> = {
  "youtube-adsense": MonitorPlay,
  "paginas-web": Globe2,
  "imagen-video": Brush,
  "cuentas-digitales": KeyRound,
};

const copyByLocale: Record<
  AppLocale,
  {
    empty: string;
    available: string;
    title: string;
    intro: string;
    priceFrom: string;
    duration: string;
    includes: string;
    process: string;
    requirements: string;
    ctaButton: string;
  }
> = {
  ht: {
    empty: "Pa gen sèvis disponib kounye a.",
    available: "Sèvis disponib",
    title: "Sèvis AUM PRODZ ofri",
    intro: "Chwazi yon sèvis epi gade detay li sou menm ekran an.",
    priceFrom: "Pri a kòmanse apati",
    duration: "Dire a kòmanse apati",
    includes: "Sa li gen ladan",
    process: "Pwosesis",
    requirements: "Sa mwen bezwen nan men ou",
    ctaButton: "Pale ak Om",
  },
  es: {
    empty: "No hay servicios disponibles ahora.",
    available: "Servicios disponibles",
    title: "Servicios que ofrece AUM PRODZ",
    intro: "Puedes elegir un servicio y ver los detalles en esta misma pantalla.",
    priceFrom: "Precio a partir de",
    duration: "Duración a partir de",
    includes: "Qué incluye",
    process: "Proceso",
    requirements: "Lo que necesito de ti",
    ctaButton: "Hablar con Om",
  },
  en: {
    empty: "No services are available right now.",
    available: "Available services",
    title: "Services AUM PRODZ offers",
    intro: "Choose a service and view the details on this same screen.",
    priceFrom: "Starting price",
    duration: "Estimated duration from",
    includes: "What is included",
    process: "Process",
    requirements: "What I need from you",
    ctaButton: "Talk to Om",
  },
  fr: {
    empty: "Aucun service disponible pour le moment.",
    available: "Services disponibles",
    title: "Services proposés par AUM PRODZ",
    intro: "Choisissez un service et consultez le détail sur le même écran.",
    priceFrom: "Prix à partir de",
    duration: "Durée à partir de",
    includes: "Ce qui est inclus",
    process: "Processus",
    requirements: "Ce dont j'ai besoin",
    ctaButton: "Parler avec Om",
  },
  pt: {
    empty: "Nenhum serviço disponível agora.",
    available: "Serviços disponíveis",
    title: "Serviços que AUM PRODZ oferece",
    intro: "Escolha um serviço e veja os detalhes nesta mesma tela.",
    priceFrom: "Preço a partir de",
    duration: "Duração a partir de",
    includes: "O que inclui",
    process: "Processo",
    requirements: "O que preciso de você",
    ctaButton: "Falar com Om",
  },
};

export function ServicesBrowser({
  initialServiceSlug,
  locale,
  services,
}: {
  initialServiceSlug?: ServiceSlug;
  locale: AppLocale;
  services: ServiceBrowserItem[];
}) {
  const copy = copyByLocale[locale] ?? copyByLocale.ht;
  const [activeSlug, setActiveSlug] = useState<ServiceSlug>(
    initialServiceSlug ?? services[0]?.slug ?? "youtube-adsense",
  );
  const activeService = useMemo(
    () =>
      services.find((service) => service.slug === activeSlug) ??
      services[0],
    [activeSlug, services],
  );

  if (!activeService) {
    return (
      <div className="mammouth-card rounded-3xl p-6 text-sm text-muted-foreground">
        {copy.empty}
      </div>
    );
  }

  const ActiveIcon = icons[activeService.slug];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 sm:gap-4">
      <div className="shrink-0 text-center lg:text-left">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-primary sm:text-xs">
          {copy.available}
        </p>
        <h1 className="mammouth-title mt-1 text-2xl leading-tight sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6 lg:mx-0">
          {copy.intro}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2 sm:gap-4 lg:grid-cols-[320px_1fr] lg:grid-rows-1">
        <aside className="min-h-0">
          <div className="grid h-full grid-cols-2 gap-2 rounded-3xl border border-border bg-surface/70 p-2 shadow-soft sm:p-3 lg:grid-cols-1">
            {services.map((service) => {
              const Icon = icons[service.slug];
              const active = service.slug === activeService.slug;

              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => setActiveSlug(service.slug)}
                  onMouseEnter={() => setActiveSlug(service.slug)}
                  onFocus={() => setActiveSlug(service.slug)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-2xl border px-2 py-2 text-left transition-colors sm:gap-3 sm:px-4 sm:py-3",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-glow"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-10",
                      active
                        ? "bg-primary-foreground/16 text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-4 sm:size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-xs font-black leading-tight sm:block sm:text-sm">
                      {service.title}
                    </span>
                    <span
                      className={cn(
                        "mt-1 hidden text-xs leading-5 sm:line-clamp-2",
                        active ? "text-primary-foreground/76" : "text-muted-foreground",
                      )}
                    >
                      {service.summary}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-h-0 overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-soft">
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-2 p-3 sm:gap-4 sm:p-4 lg:p-5">
            <div className="grid gap-2 sm:gap-4 lg:grid-cols-[1fr_270px] lg:items-start">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-12">
                  <ActiveIcon className="size-5 sm:size-6" />
                </span>
                <div className="min-w-0">
                  <h2 className="mammouth-title text-2xl leading-tight sm:text-3xl">
                    {activeService.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
                    {activeService.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-border bg-card p-2 sm:p-3">
                  <p className="text-xs text-muted-foreground">{copy.priceFrom}</p>
                  <p className="mt-1 text-lg font-black sm:text-xl">
                    {activeService.priceFrom}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-2 sm:p-3">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {copy.duration}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-black sm:text-sm">{activeService.duration}</p>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
              <CompactDetailList
                title={copy.includes}
                items={activeService.deliverables}
                numbered={false}
              />
              <CompactDetailList
                title={copy.process}
                items={activeService.modules}
                numbered
              />
              <CompactDetailList
                title={copy.requirements}
                items={activeService.requirements}
                numbered={false}
                className="hidden lg:block"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href={buildWhatsappCtaHref(activeService.slug)}
                className={cn(buttonVariants({ size: "lg" }), "shrink-0 max-sm:h-11 max-sm:px-4 max-sm:text-sm")}
              >
                <MessageCircle className="size-5" />
                {copy.ctaButton}
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompactDetailList({
  title,
  items,
  numbered,
  className,
}: {
  className?: string;
  title: string;
  items: string[];
  numbered: boolean;
}) {
  return (
    <div className={cn("min-h-0 rounded-2xl border border-border bg-card p-3 sm:p-4", className)}>
      <h3 className="text-sm font-black sm:text-base">{title}</h3>
      <div className="mt-2 grid gap-1.5 sm:mt-3 sm:gap-2">
        {items.map((item, index) => (
          <p key={item} className="flex gap-2 text-xs leading-4 text-muted-foreground sm:text-sm sm:leading-5">
            {numbered ? (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-muted text-[0.65rem] font-bold text-foreground sm:size-5 sm:text-xs">
                {index + 1}
              </span>
            ) : (
              <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-primary sm:size-3.5" />
            )}
            <span>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function buildWhatsappCtaHref(service: ServiceSlug) {
  const params = new URLSearchParams({
    service,
    source: "services",
    placement: "service_browser",
    page: "/servicios",
  });

  return `/api/cta/whatsapp?${params.toString()}`;
}
