"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  FileSignature,
  FolderOpen,
  Home,
  LifeBuoy,
  Menu,
  Music2,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/ui/command-palette";
import { NotificationCenter } from "@/components/ui/notification-center";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const iconMap = {
  badge: BadgeCheck,
  billing: CreditCard,
  contract: FileSignature,
  files: FolderOpen,
  home: Home,
  releases: Music2,
  security: ShieldCheck,
  support: LifeBuoy,
  profile: UserRound,
};

export type ArtistNavItem = {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
};

export function ArtistShellClient({
  children,
  currentLocale,
  items,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  currentLocale: AppLocale;
  items: ArtistNavItem[];
  subtitle: string;
  title: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const commandItems = useMemo(
    () =>
      items.map((item) => ({
        href: item.href,
        label: item.label,
        description: "Artist Career Operating System",
      })),
    [items],
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden min-h-0 w-80 flex-col border-r border-border bg-card/92 p-4 shadow-2xl backdrop-blur-xl lg:flex">
        <AumProdzLogo />
        <div className="mt-5 rounded-lg border border-border bg-background/64 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
            Artist OS
          </p>
          <p className="mt-2 text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <ArtistNav items={items} pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-background/72 backdrop-blur"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col border-r border-border bg-card p-4 shadow-2xl">
            <div className="flex h-14 items-center justify-between">
              <AumProdzLogo />
              <Button
                aria-label="Cerrar menú"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <ArtistNav
              items={items}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <main className="min-h-screen lg:pl-80">
        <header className="sticky top-0 z-30 border-b border-border bg-background/84 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                aria-label="Abrir menú"
                className="lg:hidden"
                size="icon"
                type="button"
                variant="secondary"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-4" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase tracking-[0.18em] text-primary">
                  {title}
                </p>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette items={commandItems} />
              <NotificationCenter />
              <ThemeToggle />
              <LanguageSwitcher compact currentLocale={currentLocale} />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function ArtistNav({
  items,
  onNavigate,
  pathname,
}: {
  items: ArtistNavItem[];
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-8 pr-1">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive =
          item.href === "/artist"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/12 text-primary shadow-[inset_3px_0_0_var(--primary)]"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
