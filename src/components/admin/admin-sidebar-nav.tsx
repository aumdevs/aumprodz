"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  BotMessageSquare,
  CreditCard,
  Download,
  FileSignature,
  FolderOpen,
  Gauge,
  KanbanSquare,
  LifeBuoy,
  LockKeyhole,
  Music2,
  PlayCircle,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  Webhook,
} from "lucide-react";

import type { AdminNavBadgeCounts } from "@/lib/admin/data";
import { getAdminNotificationSectionPath } from "@/lib/admin/notification-sections";
import { cn } from "@/lib/utils";

const iconMap = {
  barChart: BarChart3,
  bot: Bot,
  botQuality: BotMessageSquare,
  creditCard: CreditCard,
  download: Download,
  fileSignature: FileSignature,
  folderOpen: FolderOpen,
  gauge: Gauge,
  kanban: KanbanSquare,
  lifeBuoy: LifeBuoy,
  lock: LockKeyhole,
  music: Music2,
  play: PlayCircle,
  settings: Settings,
  shield: ShieldCheck,
  alert: TriangleAlert,
  users: Users,
  webhook: Webhook,
};

export type AdminNavIconKey = keyof typeof iconMap;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIconKey;
  permissions: string[];
};

type AdminSidebarNavProps = {
  items: AdminNavItem[];
  initialBadgeCounts: AdminNavBadgeCounts;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebarNav({
  collapsed = false,
  items,
  initialBadgeCounts,
  onNavigate,
}: AdminSidebarNavProps) {
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState(initialBadgeCounts);
  const currentSection = useMemo(
    () => getAdminNotificationSectionPath(pathname),
    [pathname],
  );

  useEffect(() => {
    if (!currentSection) {
      return;
    }

    queueMicrotask(() => {
      setBadgeCounts((current) => ({ ...current, [currentSection]: 0 }));
    });

    const controller = new AbortController();

    fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathname }),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { badgeCounts?: AdminNavBadgeCounts } | null) => {
        if (payload?.badgeCounts) {
          setBadgeCounts({ ...payload.badgeCounts, [currentSection]: 0 });
        }
      })
      .catch(() => {
        // The optimistic zero keeps the opened category visually read even if
        // the network request is interrupted; the next refresh will reconcile.
      });

    return () => {
      controller.abort();
    };
  }, [currentSection, pathname]);

  useEffect(() => {
    const refreshCounts = () => {
      fetch("/api/admin/notifications")
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { badgeCounts?: AdminNavBadgeCounts } | null) => {
          if (payload?.badgeCounts) {
            setBadgeCounts(payload.badgeCounts);
          }
        })
        .catch(() => undefined);
    };
    const intervalId = window.setInterval(refreshCounts, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-8 pr-1">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const badgeCount = badgeCounts[item.href] ?? 0;
        const isActive =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/12 text-primary shadow-[inset_3px_0_0_var(--primary)]"
                : "text-muted-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {collapsed ? null : (
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            )}
            {badgeCount > 0 ? (
              <span
                aria-label={`${formatBadgeCount(badgeCount)} pendientes`}
                className={cn(
                  "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-black leading-none text-destructive-foreground ring-2 ring-card",
                  collapsed && "absolute ml-7 mt-[-18px]",
                )}
                title={`${badgeCount} elementos sin revisar`}
              >
                {formatBadgeCount(badgeCount)}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}
