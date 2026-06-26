import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel overflow-hidden rounded-xl p-8 sm:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
            AUM PRODZ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }))}>
            {primaryLabel}
            <ArrowRight className="size-5" />
          </Link>
          {secondaryLabel && secondaryHref ? (
            <Link
              href={secondaryHref}
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
