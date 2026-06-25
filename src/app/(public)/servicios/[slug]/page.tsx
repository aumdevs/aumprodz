import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicServiceBySlug,
  localServices,
} from "@/lib/content/services";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return localServices.map((service) => ({ slug: service.slug }));
}

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
  const service = await getPublicServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;
  const pagePath = `/servicios/${service.slug}`;

  return (
    <article className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PublicEventTracker
        eventName="service_detail_view"
        page={pagePath}
        service={service.slug}
        source="service_detail"
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="space-y-5">
            <Badge tone="default">
              {service.eyebrow}
            </Badge>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-7" />
              </span>
              <h1 className="text-4xl font-black tracking-normal sm:text-5xl">
                {service.title}
              </h1>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {service.description}
            </p>
          </div>

          <section className="grid gap-5 md:grid-cols-3">
            {service.outcomes.map((outcome) => (
              <Card key={outcome}>
                <CardHeader>
                  <Sparkles className="size-5 text-primary" />
                  <CardTitle className="text-base">Resultado</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Qué incluye</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Proceso</CardTitle>
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

          <section className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <ClipboardCheck className="size-6 text-primary" />
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.requirements.map((requirement) => (
                  <p key={requirement} className="text-sm leading-6 text-muted-foreground">
                    {requirement}
                  </p>
                ))}
              </CardContent>
            </Card>
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
              <div className="mt-5 grid gap-4">
                {service.faqs.map((faq) => (
                  <div key={faq.question} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-muted-foreground">Precio desde</p>
                  <p className="mt-1 font-bold">{service.priceFrom}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-muted-foreground">Duración</p>
                  <p className="mt-1 font-bold">{service.duration}</p>
                </div>
              </div>
              <WhatsappCtaLink
                service={service.slug}
                source="service_detail"
                placement="summary_cta"
                page={pagePath}
                label="Consultar por WhatsApp"
                size="lg"
                className="w-full"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                El clic se registra primero en AUM PRODZ Platform y luego abre
                WhatsApp con un mensaje preparado para este servicio.
              </p>
              <Link
                href="/servicios"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-center",
                )}
              >
                Ver todos los servicios
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}
