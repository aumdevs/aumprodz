import { LifeBuoy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function SupportTicketCard({
  title,
  detail,
  status = "abierto",
}: {
  title: string;
  detail?: string;
  status?: string;
}) {
  return (
    <Card>
      <CardContent className="flex gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LifeBuoy className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{title}</p>
          {detail ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
          ) : null}
        </div>
        <Badge tone="muted">{status}</Badge>
      </CardContent>
    </Card>
  );
}
