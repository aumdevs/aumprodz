import Link from "next/link";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminReportsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { permissions } = await requirePermission("analytics.read", "/admin/reports");
  const canExportReports = permissions.includes("reports.export");
  const params = await searchParams;
  const from = readParam(params.from);
  const to = readParam(params.to);
  const { metrics, funnel, errors } = await getAdminReportsData({ from, to });
  const query = new URLSearchParams();

  if (from) {
    query.set("from", from);
  }

  if (to) {
    query.set("to", to);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Reportes"
        title="Reportes"
        description="Resumen por fecha de contactos, pagos, artistas, lanzamientos, contratos y verificaciones."
      />
      <AdminDataAlert errors={errors} />

      <form className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]">
        <input
          type="date"
          name="from"
          defaultValue={from ?? ""}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={to ?? ""}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        />
        <Button type="submit">Filtrar</Button>
      </form>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle className="text-sm">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversión real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-6">
            {funnel.map((item) => (
              <div key={item.label} className="rounded-md border border-border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-black">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {canExportReports ? (
      <Card>
        <CardHeader>
          <CardTitle>Exportaciones CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {reportExportTypes.map((item) => (
              <Link
                key={item.type}
                href={`/api/admin/reports/export?type=${item.type}&${query.toString()}`}
                className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
              >
                Exportar {item.label}
              </Link>
            ))}
        </CardContent>
      </Card>
      ) : null}
    </div>
  );
}

const reportExportTypes = [
  { type: "leads", label: "contactos" },
  { type: "payments", label: "pagos" },
  { type: "artists", label: "artistas" },
  { type: "releases", label: "lanzamientos" },
  { type: "tickets", label: "soporte" },
  { type: "contracts", label: "contratos" },
  { type: "artist_reports", label: "reportes artísticos" },
];

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
