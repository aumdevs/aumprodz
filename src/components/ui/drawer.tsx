"use client";

import type React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur">
      <aside
        className={cn(
          "h-full w-[min(92vw,360px)] border-r border-border bg-card p-4 shadow-2xl",
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-bold">{title}</p>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </aside>
    </div>
  );
}
