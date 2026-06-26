"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LockKeyhole, Menu, X } from "lucide-react";
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
  artistDashboard: string;
  close: string;
  menu: string;
  privateAccess: string;
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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-3">
          <div className="min-w-0 shrink-0">
            <AumProdzLogo compact className="sm:hidden" />
            <AumProdzLogo className="hidden sm:inline-flex" />
          </div>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 rounded-md border border-border/70 bg-card/52 p-1 text-sm font-semibold text-muted-foreground lg:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded px-3 py-2 transition-colors hover:bg-muted hover:text-foreground",
                  isActivePath(pathname, item.href) &&
                    "bg-primary/12 text-primary",
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
              className="hidden rounded-md px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:inline-flex"
            >
              {copy.artistDashboard}
            </Link>
            <Link
              href="/servicios"
              className={cn(buttonVariants({ variant: "accent", size: "sm" }))}
            >
              {copy.projectCta}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? copy.close : copy.menu}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted md:hidden"
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-border/70 pb-4 pt-3 md:hidden">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActivePath(pathname, item.href) &&
                      "bg-primary/12 text-primary",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid gap-3 rounded-lg border border-border bg-card/80 p-3">
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
                {copy.artistDashboard}
                <ArrowRight className="size-4" />
              </Link>
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {copy.privateAccess}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/login?next=%2Fadmin"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <LockKeyhole className="size-3.5" />
                  Admin
                </Link>
                <Link
                  href="/login?next=%2Fsuper-admin"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <LockKeyhole className="size-3.5" />
                  Super
                </Link>
                </div>
              </div>
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
