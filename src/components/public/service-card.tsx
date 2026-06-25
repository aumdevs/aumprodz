import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import type { Service } from "@/lib/content/services";

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Card className="h-full transition-transform hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <Badge tone="default">
            Desde {service.priceFrom}
          </Badge>
        </div>
        <CardTitle>{service.title}</CardTitle>
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
            Ver detalle
            <ArrowUpRight className="size-4" />
          </Link>
          <WhatsappCtaLink
            service={service.slug}
            source="services_listing"
            placement="service_card"
            page="/servicios"
            label="WhatsApp"
            variant="secondary"
            size="sm"
            className="sm:ml-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}
