import { cn } from "@/lib/utils";

export function Tabs({
  items,
  active,
}: {
  items: { href: string; label: string }[];
  active?: string;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted p-1">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            "shrink-0 rounded-md px-3 py-2 text-sm font-bold transition-colors",
            active === item.href
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
