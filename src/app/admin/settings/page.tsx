import { Settings } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSetupStatus } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePermission("settings.manage", "/admin/settings");
  const setup = getAdminSetupStatus();
  const grouped = Object.groupBy(setup, (item) => item.area);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Ajustes"
        title="Ajustes del sistema"
        description="Revisión de conexiones necesarias para que la plataforma funcione correctamente."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {Object.entries(grouped).map(([area, items]) => (
          <Card key={area}>
            <CardHeader>
              <Settings className="size-5 text-primary" />
              <CardTitle>{area}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(items ?? []).map((item) => (
                <div
                  key={item.env}
                  className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.env}</p>
                  </div>
                  <Badge tone={item.configured ? "default" : "danger"}>
                    {item.configured ? "Configurado" : "Pendiente"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
