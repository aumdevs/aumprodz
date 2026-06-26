import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "gold" | "danger" | "success" | "warning" | "info";
}) {
  const toneClasses = {
    default: "from-primary/20 text-primary",
    gold: "from-accent/25 text-accent",
    danger: "from-destructive/20 text-destructive",
    success: "from-success/20 text-success",
    warning: "from-warning/20 text-warning",
    info: "from-info/20 text-info",
  };

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black tracking-normal">{value}</p>
        </div>
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-md bg-gradient-to-br to-transparent",
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {detail ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
