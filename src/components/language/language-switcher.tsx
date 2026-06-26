"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const activeLocale =
    pendingLocale && pendingLocale !== currentLocale ? pendingLocale : currentLocale;
  const currentPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const activeLabel = compact ? activeLocale.toUpperCase() : localeLabels[activeLocale];

  async function changeLocale(locale: AppLocale, fallbackHref: string) {
    setPendingLocale(locale);
    setOpen(false);

    if (locale === currentLocale) {
      return;
    }

    try {
      const response = await fetch(
        `/api/language?locale=${locale}&redirect=false`,
        {
          cache: "no-store",
          credentials: "same-origin",
        },
      );

      if (!response.ok) {
        throw new Error("Could not update language");
      }

      router.refresh();
    } catch {
      setPendingLocale(null);
      window.location.assign(fallbackHref);
    }
  }

  return (
    <div
      aria-label={activeLocale === "ht" ? "Chanje lang" : "Cambiar idioma"}
      className="relative inline-flex"
    >
      <button
        aria-expanded={open}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-black text-foreground shadow-sm transition-colors hover:bg-muted"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        {activeLabel}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 grid min-w-36 gap-1 rounded-2xl border border-border bg-card p-2 shadow-soft">
      {supportedLocales.map((locale) => {
        const active = locale === activeLocale;
        const label = compact ? locale.toUpperCase() : localeLabels[locale];
        const href = `/api/language?locale=${locale}&next=${encodeURIComponent(currentPath)}`;

        return (
          <a
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-bold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            href={href}
            key={locale}
            onClick={(event) => {
              event.preventDefault();
              void changeLocale(locale, href);
            }}
          >
            {label}
          </a>
        );
      })}
        </div>
      ) : null}
    </div>
  );
}
