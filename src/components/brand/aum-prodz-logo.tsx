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
        <span className="min-w-0 text-sm font-black uppercase tracking-[0.16em] text-foreground sm:text-base">
          <span>AUM PRODZ</span>
          <span className="ml-2 text-muted-foreground">{platformLabel}</span>
        </span>
      ) : null}
    </Link>
  );
}
