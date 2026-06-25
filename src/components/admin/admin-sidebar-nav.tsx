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
};

export function AdminSidebarNav({
  items,
  initialBadgeCounts,
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

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {badgeCount > 0 ? (
              <span
                aria-label={`${formatBadgeCount(badgeCount)} pendientes`}
                className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-black leading-none text-destructive-foreground ring-2 ring-card"
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
