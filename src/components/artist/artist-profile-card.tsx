import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ArtistProfileCard({
  artistName,
  legalName,
  status,
}: {
  artistName?: string | null;
  legalName?: string | null;
  status?: string | null;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <UserRound className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-black">
            {artistName ?? legalName ?? "Artista AUM PRODZ"}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {legalName ?? "Perfil artístico"}
          </p>
        </div>
        <Badge className="ml-auto" tone="accent">
          {status ?? "activo"}
        </Badge>
      </CardContent>
    </Card>
  );
}
