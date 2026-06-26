"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type PublicNavItem = {
  href: string;
  label: string;
};

type PublicHeaderCopy = {
  artistCta: string;
  close: string;
  menu: string;
  platformLabel: string;
  projectCta: string;
};

export function PublicHeaderClient({
  copy,
  currentLocale,
  navItems,
}: {
  copy: PublicHeaderCopy;
  currentLocale: AppLocale;
  navItems: PublicNavItem[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/82 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
      <div className="public-shell">
        <div className="grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="min-w-0 shrink-0">
            <AumProdzLogo
              compact
              className="sm:hidden"
              platformLabel={copy.platformLabel}
            />
            <AumProdzLogo
              className="hidden sm:inline-flex"
              platformLabel={copy.platformLabel}
            />
          </div>

          <nav
            aria-label="Main navigation"
            className="mx-auto hidden items-center gap-1 rounded-full bg-transparent px-2 py-1 text-sm font-bold text-muted-foreground lg:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground",
                  isActivePath(pathname, item.href) &&
                    "bg-card text-foreground shadow-sm",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden min-w-0 items-center gap-2 md:flex">
            <LanguageSwitcher compact currentLocale={currentLocale} />
            <ThemeToggle />
            <Link
              href="/login?next=%2Fartist"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              {copy.artistCta}
            </Link>
            <Link
              href="/servicios"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              {copy.projectCta}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? copy.close : copy.menu}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted md:hidden"
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-3 rounded-2xl border border-border bg-card p-3 shadow-soft md:hidden">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActivePath(pathname, item.href) &&
                      "bg-muted text-foreground",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <LanguageSwitcher compact currentLocale={currentLocale} />
                <ThemeToggle />
              </div>
              <Link
                href="/servicios"
                className={cn(buttonVariants({ variant: "accent" }), "w-full")}
                onClick={() => setMobileOpen(false)}
              >
                {copy.projectCta}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login?next=%2Fartist"
                className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                onClick={() => setMobileOpen(false)}
              >
                {copy.artistCta}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
