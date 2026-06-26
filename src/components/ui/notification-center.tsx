"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotificationCenter({ count = 0 }: { count?: number }) {
  return (
    <Button aria-label="Notificaciones" className="relative" size="icon" type="button" variant="secondary">
      <Bell className="size-4" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Button>
  );
}
