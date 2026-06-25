import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AdminDataAlertProps = {
  errors: string[];
};

export function AdminDataAlert({ errors }: AdminDataAlertProps) {
  const visibleErrors = errors.filter(Boolean);

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex gap-3 p-4 text-sm leading-6 text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-semibold">Algunos datos no se pudieron cargar.</p>
          <p className="text-destructive/80">
            Revisa permisos internos, migraciones o variables de Supabase.
          </p>
          <ul className="mt-2 list-inside list-disc text-xs">
            {visibleErrors.slice(0, 4).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
