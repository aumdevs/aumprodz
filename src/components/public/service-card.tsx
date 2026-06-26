import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
    <Card className="group h-full overflow-hidden transition-transform hover:-translate-y-1">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-[var(--haiti-red)]" />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary shadow-glow">
            <Icon className="size-5" />
          </span>
          <Badge tone="default">
            {t(locale, "common.from")} {service.priceFrom}
          </Badge>
        </div>
        <CardTitle className="text-2xl">{service.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {service.summary}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/servicios/${service.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
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
