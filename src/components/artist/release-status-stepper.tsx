import { CheckCircle2, Circle, CircleDot } from "lucide-react";

import { cn } from "@/lib/utils";

export type ReleaseStepperItem = {
  label: string;
  state: "done" | "current" | "pending";
};

export function ReleaseStatusStepper({ items }: { items: ReleaseStepperItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon =
          item.state === "done" ? CheckCircle2 : item.state === "current" ? CircleDot : Circle;

        return (
          <div
            className={cn(
              "flex items-center gap-3 rounded-md border p-3 text-sm font-semibold",
              item.state === "done" && "border-success/30 bg-success/10 text-success",
              item.state === "current" && "border-primary/35 bg-primary/10 text-primary",
              item.state === "pending" && "border-border bg-muted/40 text-muted-foreground",
            )}
            key={item.label}
          >
            <Icon className="size-4" />
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
