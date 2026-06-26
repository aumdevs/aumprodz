"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Command, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CommandPaletteItem = {
  href: string;
  label: string;
  description?: string;
};

export function CommandPalette({ items }: { items: CommandPaletteItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return items.slice(0, 8);
    }

    return items
      .filter((item) =>
        `${item.label} ${item.description ?? ""}`
          .toLowerCase()
          .includes(cleanQuery),
      )
      .slice(0, 10);
  }, [items, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        className="hidden min-w-40 justify-start text-muted-foreground sm:inline-flex"
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        <Command className="size-4" />
        Buscar
        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-black">
          ⌘K
        </span>
      </Button>
      <Button
        aria-label="Abrir búsqueda"
        className="sm:hidden"
        size="icon"
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-background/72 p-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                autoFocus
                className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="Buscar sección, acción o módulo..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button
                aria-label="Cerrar búsqueda"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.map((item) => (
                <Link
                  className={cn(
                    "block rounded-md px-3 py-3 transition-colors",
                    "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <span className="block text-sm font-bold">{item.label}</span>
                  {item.description ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </Link>
              ))}
              {filtered.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No hay resultados para esa búsqueda.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
