"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  localeLabels,
  supportedLocales,
  type AppLocale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  currentLocale: AppLocale;
  compact?: boolean;
};

export function LanguageSwitcher({
  compact = false,
  currentLocale,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  return (
    <div
      aria-label={currentLocale === "ht" ? "Chanje lang" : "Cambiar idioma"}
      className="inline-flex rounded-md border border-border bg-card p-1"
    >
      {supportedLocales.map((locale) => {
        const active = locale === currentLocale;
        const label = compact ? locale.toUpperCase() : localeLabels[locale];

        return (
          <Link
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded px-2.5 py-1.5 text-xs font-bold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            href={`/api/language?locale=${locale}&next=${encodeURIComponent(currentPath)}`}
            key={locale}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
