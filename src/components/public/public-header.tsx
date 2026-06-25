import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/servicios", labelKey: "nav.services" },
  { href: "/youtube", labelKey: "nav.youtube" },
  { href: "/contacto", labelKey: "nav.contact" },
] as const;

export async function PublicHeader() {
  const locale = await getCurrentLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <AumProdzLogo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {t(locale, item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact currentLocale={locale} />
            <Link
              href="/artista"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "inline-flex",
              )}
            >
              {t(locale, "nav.artists")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-border/70 py-3 text-sm font-medium text-muted-foreground md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 transition-colors hover:text-foreground"
            >
              {t(locale, item.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
