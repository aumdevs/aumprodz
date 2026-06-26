import { Activity } from "lucide-react";

export type ActivityFeedItem = {
  id: string;
  title: string;
  detail?: string;
  time?: string;
};

export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        No hay actividad reciente.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div className="flex gap-3 rounded-md border border-border bg-background/55 p-3" key={item.id}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Activity className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{item.title}</p>
            {item.detail ? (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {item.detail}
              </p>
            ) : null}
            {item.time ? (
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                {item.time}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
