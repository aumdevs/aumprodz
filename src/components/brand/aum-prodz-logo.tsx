import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AumProdzLogoProps = {
  compact?: boolean;
  className?: string;
  platformLabel?: string;
};

export function AumProdzLogo({
  compact = false,
  className,
  platformLabel = "Plataforma",
}: AumProdzLogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 font-semibold", className)}
      aria-label={`AUM PRODZ ${platformLabel}`}
    >
      <Image
        src="/aum-prodz-logo-transparent.png"
        alt=""
        width={96}
        height={96}
        className={cn(
          "shrink-0 rounded-full object-contain",
          compact ? "size-10" : "size-12",
        )}
      />
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-sm uppercase tracking-[0.18em] text-muted-foreground">
            AUM PRODZ
          </span>
          <span className="block text-base text-foreground">{platformLabel}</span>
        </span>
      ) : null}
    </Link>
  );
}
