import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { ServiceSlug } from "@/lib/content/services";
import { cn } from "@/lib/utils";

type WhatsappCtaLinkProps = {
  service: ServiceSlug;
  source: string;
  placement: string;
  page?: string;
  label?: string;
  variant?: "default" | "secondary" | "accent" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function buildWhatsappCtaHref({
  service,
  source,
  placement,
  page,
}: Pick<WhatsappCtaLinkProps, "service" | "source" | "placement" | "page">) {
  const params = new URLSearchParams({
    service,
    source,
    placement,
  });

  if (page) {
    params.set("page", page);
  }

  return `/api/cta/whatsapp?${params.toString()}`;
}

export function WhatsappCtaLink({
  service,
  source,
  placement,
  page,
  label = "Hablar por WhatsApp",
  variant = "default",
  size = "default",
  className,
}: WhatsappCtaLinkProps) {
  return (
    <Link
      href={buildWhatsappCtaHref({ service, source, placement, page })}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {label}
      <ArrowRight className="size-4" />
    </Link>
  );
}
