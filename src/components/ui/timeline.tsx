import { cn } from "@/lib/utils";

export type TimelineItem = {
  title: string;
  description?: string;
  meta?: string;
  status?: "done" | "current" | "pending" | "danger";
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li className="flex gap-3" key={`${item.title}-${index}`}>
          <span
            className={cn(
              "mt-1 flex size-3 shrink-0 rounded-full ring-4",
              item.status === "done" && "bg-success ring-success/15",
              item.status === "current" && "bg-primary ring-primary/15",
              item.status === "danger" && "bg-destructive ring-destructive/15",
              (!item.status || item.status === "pending") && "bg-muted-foreground ring-muted",
            )}
          />
          <span>
            <span className="block text-sm font-bold">{item.title}</span>
            {item.description ? (
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {item.description}
              </span>
            ) : null}
            {item.meta ? (
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                {item.meta}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
