"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, X } from "lucide-react";

import {
  AdminSidebarNav,
  type AdminNavItem,
} from "@/components/admin/admin-sidebar-nav";
import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/ui/command-palette";
import { NotificationCenter } from "@/components/ui/notification-center";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AdminNavBadgeCounts } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

type AdminShellClientProps = {
  children: React.ReactNode;
  items: AdminNavItem[];
  initialBadgeCounts: AdminNavBadgeCounts;
  mode?: "admin" | "super";
  roles: string[];
  userEmail?: string;
};

export function AdminShellClient({
  children,
  items,
  initialBadgeCounts,
  mode = "admin",
  roles,
  userEmail,
}: AdminShellClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notificationCount = useMemo(
    () => Object.values(initialBadgeCounts).reduce((sum, count) => sum + count, 0),
    [initialBadgeCounts],
  );
  const commandItems = useMemo(
    () =>
      items.map((item) => ({
        href: item.href,
        label: item.label,
        description: item.permissions.length
          ? `Permisos: ${item.permissions.join(", ")}`
          : "Acceso general del panel",
      })),
    [items],
  );

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden min-h-0 flex-col border-r border-border bg-card/92 p-4 shadow-2xl backdrop-blur-xl transition-[width] lg:flex",
          collapsed ? "w-20" : "w-80",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center gap-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <AumProdzLogo compact={collapsed} />
          <Button
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => setCollapsed((current) => !current)}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {!collapsed ? (
          <div className="mt-5 rounded-lg border border-border bg-background/64 p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              {mode === "super" ? "Super Admin" : "Operación"}
            </p>
            <p className="mt-2 text-sm font-semibold">
              Panel profesional AUM PRODZ
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Control de servicios, artistas, pagos, contratos y actividad real.
            </p>
          </div>
        ) : null}

        <AdminSidebarNav
          collapsed={collapsed}
          initialBadgeCounts={initialBadgeCounts}
          items={items}
        />
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
            <AdminSidebarNav
              initialBadgeCounts={initialBadgeCounts}
              items={items}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <main
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-80",
        )}
      >
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
                  {mode === "super" ? "Super Admin" : "AUM PRODZ Admin"}
                </p>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Administración, operación y seguimiento diario.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette items={commandItems} />
              <NotificationCenter count={notificationCount} />
              <ThemeToggle />
              <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs md:flex">
                <ShieldCheck className="size-4 text-success" />
                <span className="max-w-44 truncate">
                  {userEmail ?? (roles.join(", ") || "admin")}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
