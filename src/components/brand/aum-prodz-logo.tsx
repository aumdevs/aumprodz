import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AumProdzLogoProps = {
  compact?: boolean;
  className?: string;
};

export function AumProdzLogo({ compact = false, className }: AumProdzLogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 font-semibold", className)}
      aria-label="AUM PRODZ Platform"
    >
      <Image
        src="/aum-prodz-logo.png"
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
          <span className="block text-base text-foreground">Plataforma</span>
        </span>
      ) : null}
    </Link>
  );
}
