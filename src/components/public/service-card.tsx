import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import type { Service } from "@/lib/content/services";
import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dictionaries";

type ServiceCardProps = {
  service: Service;
  locale: AppLocale;
};

export function ServiceCard({ locale, service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Card className="glow-card group h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-[var(--haiti-red)]" />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary shadow-glow transition-transform group-hover:scale-105">
            <Icon className="size-5" />
          </span>
          <Badge tone="default">
            {t(locale, "common.from")} {service.priceFrom}
          </Badge>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {service.eyebrow}
          </p>
          <CardTitle className="mt-2 text-2xl">{service.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {service.summary}
        </p>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
          <Clock3 className="size-4 text-primary" />
          <span>{service.duration}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/servicios/${service.slug}`}
            className="inline-flex items-center gap-2 rounded-md px-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {t(locale, "common.viewDetail")}
            <ArrowUpRight className="size-4" />
          </Link>
          <WhatsappCtaLink
            service={service.slug}
            source="services_listing"
            placement="service_card"
            page="/servicios"
            label={t(locale, "common.whatsapp")}
            variant="secondary"
            size="sm"
            className="sm:ml-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}
