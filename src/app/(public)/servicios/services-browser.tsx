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
  Sparkles,
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
  faqs: { question: string; answer: string }[];
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
    packages: string;
    requirements: string;
    faqs: string;
    ctaTitle: string;
    ctaText: (serviceTitle: string) => string;
    ctaButton: string;
  }
> = {
  ht: {
    empty: "Pa gen sèvis disponib kounye a.",
    available: "Sèvis disponib",
    title: "Sèvis Aum ofri",
    intro: "Chwazi yon sèvis epi gade detay la isit la.",
    priceFrom: "Pri apati",
    duration: "Dire",
    includes: "Sa li gen ladan",
    process: "Pwosesis",
    packages: "Pakè disponib",
    requirements: "Sa mwen bezwen nan men ou",
    faqs: "Kesyon moun poze souvan",
    ctaTitle: "Ou vle travay sèvis sa a?",
    ctaText: (serviceTitle) =>
      `Louvri WhatsApp ak mesaj la pare pou ${serviceTitle}.`,
    ctaButton: "Pale ak Aum",
  },
  es: {
    empty: "No hay servicios disponibles ahora.",
    available: "Servicios disponibles",
    title: "Servicios que ofrece Aum",
    intro: "Elige un servicio y mira el detalle aquí mismo.",
    priceFrom: "Precio desde",
    duration: "Duración",
    includes: "Qué incluye",
    process: "Proceso",
    packages: "Paquetes disponibles",
    requirements: "Lo que necesito de ti",
    faqs: "Preguntas comunes",
    ctaTitle: "¿Quieres trabajar este servicio?",
    ctaText: (serviceTitle) =>
      `Abre WhatsApp con el mensaje preparado para ${serviceTitle}.`,
    ctaButton: "Hablar con Aum",
  },
  en: {
    empty: "No services are available right now.",
    available: "Available services",
    title: "Services Aum offers",
    intro: "Choose a service and view the details here.",
    priceFrom: "Starting at",
    duration: "Duration",
    includes: "What is included",
    process: "Process",
    packages: "Available packages",
    requirements: "What I need from you",
    faqs: "Common questions",
    ctaTitle: "Want to work on this service?",
    ctaText: (serviceTitle) =>
      `Open WhatsApp with a prepared message for ${serviceTitle}.`,
    ctaButton: "Talk to Aum",
  },
  fr: {
    empty: "Aucun service disponible pour le moment.",
    available: "Services disponibles",
    title: "Services proposés par Aum",
    intro: "Choisissez un service et consultez le détail ici.",
    priceFrom: "À partir de",
    duration: "Durée",
    includes: "Ce qui est inclus",
    process: "Processus",
    packages: "Forfaits disponibles",
    requirements: "Ce dont j'ai besoin",
    faqs: "Questions fréquentes",
    ctaTitle: "Vous voulez travailler ce service?",
    ctaText: (serviceTitle) =>
      `Ouvrez WhatsApp avec un message préparé pour ${serviceTitle}.`,
    ctaButton: "Parler avec Aum",
  },
  pt: {
    empty: "Nenhum serviço disponível agora.",
    available: "Serviços disponíveis",
    title: "Serviços que Aum oferece",
    intro: "Escolha um serviço e veja os detalhes aqui.",
    priceFrom: "Preço a partir de",
    duration: "Duração",
    includes: "O que inclui",
    process: "Processo",
    packages: "Pacotes disponíveis",
    requirements: "O que preciso de você",
    faqs: "Perguntas comuns",
    ctaTitle: "Quer trabalhar este serviço?",
    ctaText: (serviceTitle) =>
      `Abra o WhatsApp com a mensagem preparada para ${serviceTitle}.`,
    ctaButton: "Falar com Aum",
  },
};

export function ServicesBrowser({
  locale,
  services,
}: {
  locale: AppLocale;
  services: ServiceBrowserItem[];
}) {
  const copy = copyByLocale[locale] ?? copyByLocale.ht;
  const [activeSlug, setActiveSlug] = useState<ServiceSlug>(
    services[0]?.slug ?? "youtube-adsense",
  );
  const activeService = useMemo(
    () =>
      services.find((service) => service.slug === activeSlug) ??
      services[0],
    [activeSlug, services],
  );

  if (!activeService) {
    return (
      <div className="rounded-md border border-border bg-muted p-6 text-sm text-muted-foreground">
        {copy.empty}
      </div>
    );
  }

  const ActiveIcon = icons[activeService.slug];

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {copy.available}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-normal">
            {copy.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {copy.intro}
          </p>

          <div className="mt-5 grid gap-2">
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
                    "group flex w-full items-center gap-3 rounded-md border p-4 text-left transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-md",
                      active
                        ? "bg-primary-foreground/16 text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold">
                      {service.title}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-xs leading-5",
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
        </div>
      </aside>

      <section className="rounded-lg border border-border bg-card">
        <div className="grid gap-7 p-5 sm:p-7 lg:max-h-[calc(100svh-8.5rem)] lg:overflow-y-auto">
          <div className="grid gap-5 lg:grid-cols-[1fr_260px] lg:items-start">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ActiveIcon className="size-7" />
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">
                    {activeService.eyebrow}
                  </p>
                  <h1 className="mt-1 text-4xl font-black tracking-normal">
                    {activeService.title}
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {activeService.description}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">{copy.priceFrom}</p>
                <p className="mt-1 text-2xl font-black">
                  {activeService.priceFrom}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="size-4" />
                  {copy.duration}
                </p>
                <p className="mt-1 font-bold">{activeService.duration}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {activeService.outcomes.map((outcome) => (
              <div
                key={outcome}
                className="rounded-md border border-border bg-background p-4"
              >
                <Sparkles className="mb-3 size-5 text-primary" />
                <p className="text-sm leading-6">{outcome}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <DetailList
              title={copy.includes}
              items={activeService.deliverables}
              numbered={false}
            />
            <DetailList
              title={copy.process}
              items={activeService.modules}
              numbered
            />
          </div>

          {activeService.packages.length > 0 ? (
            <div className="rounded-md border border-border bg-background p-5">
              <h3 className="text-xl font-bold">{copy.packages}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {activeService.packages.map((item) => (
                  <div
                    key={`${item.title}-${item.priceLabel}`}
                    className="rounded-md border border-border bg-card p-4"
                  >
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      {item.priceLabel ? (
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
                          {item.priceLabel}
                        </span>
                      ) : null}
                      {item.duration ? (
                        <span className="rounded-md bg-muted px-2 py-1">
                          {item.duration}
                        </span>
                      ) : null}
                    </div>
                    {item.features.length > 0 ? (
                      <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        {item.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeService.media.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeService.media.map((item) => (
                <figure
                  key={item.url}
                  className="overflow-hidden rounded-md border border-border bg-background"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.altText || item.title}
                    className="aspect-video w-full object-cover"
                  />
                  {item.title ? (
                    <figcaption className="p-3 text-sm font-semibold">
                      {item.title}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <DetailList
              title={copy.requirements}
              items={activeService.requirements}
              numbered={false}
            />
            <div className="rounded-md border border-border bg-background p-5">
              <h3 className="text-xl font-bold">{copy.faqs}</h3>
              <div className="mt-4 grid gap-4">
                {activeService.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="border-t border-border pt-4 first:border-t-0 first:pt-0"
                  >
                    <p className="font-semibold">{faq.question}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black">{copy.ctaTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {copy.ctaText(activeService.title)}
              </p>
            </div>
            <Link
              href={buildWhatsappCtaHref(activeService.slug)}
              className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
            >
              <MessageCircle className="size-5" />
              {copy.ctaButton}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailList({
  title,
  items,
  numbered,
}: {
  title: string;
  items: string[];
  numbered: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-5">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <p key={item} className="flex gap-3 text-sm leading-6">
            {numbered ? (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold">
                {index + 1}
              </span>
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            )}
            {item}
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
