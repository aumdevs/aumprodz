import Link from "next/link";
import { BarChart3, DollarSign, Music2, PlusCircle } from "lucide-react";

import { createArtistReportEntryAction } from "@/app/admin/artist-reports/actions";
import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminArtistReportsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  saved: "Reporte artístico cargado correctamente.",
  missing: "Completa artista, periodo, plataforma y fechas.",
  "artist-not-found": "No encontré el artista seleccionado.",
  error: "No se pudo guardar el reporte artístico. Revisa la migración o permisos.",
};

export default async function AdminArtistReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("artist_reports.manage", "/admin/artist-reports");
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const { artists, releases, entries, errors } = await getAdminArtistReportsData();
  const totals = entries.reduce(
    (acc, entry) => ({
      streams: acc.streams + Number(entry.streams ?? 0),
      views: acc.views + Number(entry.views ?? 0),
      revenue: acc.revenue + Number(entry.revenue_amount ?? 0),
    }),
    { streams: 0, views: 0, revenue: 0 },
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Reportes artísticos"
        title="Reportes artísticos"
        description="Carga manual de métricas reales por artista, lanzamiento, plataforma y periodo."
      />

      {status ? (
        <Card className={status === "saved" ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}>
          <CardContent className={status === "saved" ? "p-4 text-sm font-medium text-primary" : "p-4 text-sm font-medium text-destructive"}>
            {statusMessages[status] ?? statusMessages.error}
          </CardContent>
        </Card>
      ) : null}
      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          detail="Entradas reales cargadas."
          icon={BarChart3}
          label="Reportes"
          value={formatNumber(entries.length)}
        />
        <AdminStatCard
          detail="Escuchas y reproducciones reportadas."
          icon={Music2}
          label="Reproducciones"
          value={formatNumber(totals.streams)}
        />
        <AdminStatCard
          detail="Ingresos declarados en USD."
          icon={DollarSign}
          label="Ingresos"
          value={formatCurrency(totals.revenue, "USD")}
        />
      </div>

      <Card>
        <CardHeader>
          <PlusCircle className="size-5 text-primary" />
          <CardTitle>Cargar reporte manual</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createArtistReportEntryAction} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2 text-sm font-medium">
                Artista
                <select
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                  name="artist_profile_id"
                  required
                >
                  <option value="">Seleccionar artista</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.artist_name ?? artist.legal_name ?? artist.profiles?.email ?? artist.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                Lanzamiento
                <select
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                  name="release_id"
                >
                  <option value="">Sin lanzamiento específico</option>
                  {releases.map((release) => (
                    <option key={release.id} value={release.id}>
                      {release.title} / {release.primary_artist}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                Periodo desde
                <Input name="period_start" required type="date" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Periodo hasta
                <Input name="period_end" required type="date" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2 text-sm font-medium">
                Nombre del reporte
                <Input name="period_title" placeholder="Ej. Spotify enero 2026" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Canción opcional
                <Input name="song_title" placeholder="Nombre de canción" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Plataforma
                <Input name="platform" placeholder="Spotify, YouTube, TikTok..." required />
              </label>
              <label className="space-y-2 text-sm font-medium">
                País opcional
                <Input name="country" placeholder="HT, US, CL..." />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2 text-sm font-medium">
                Reproducciones
                <Input defaultValue="0" min="0" name="streams" type="number" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Vistas
                <Input defaultValue="0" min="0" name="views" type="number" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Ingresos
                <Input defaultValue="0" min="0" name="revenue_amount" step="0.01" type="number" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Moneda
                <Input defaultValue="USD" maxLength={3} name="currency" />
              </label>
            </div>
            <label className="space-y-2 text-sm font-medium">
              Notas
              <textarea
                className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                name="notes"
                placeholder="Detalle interno opcional"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">
                <PlusCircle className="size-4" />
                Guardar reporte
              </Button>
              <Link
                className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted"
                href="/api/admin/reports/export?type=artist_reports"
              >
                Exportar reportes artísticos
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <BarChart3 className="size-5 text-primary" />
          <CardTitle>Reportes cargados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Artista</th>
                  <th className="py-3 pr-4">Lanzamiento</th>
                  <th className="py-3 pr-4">Plataforma</th>
                  <th className="py-3 pr-4">Periodo</th>
                  <th className="py-3 pr-4">Métricas</th>
                  <th className="py-3 pr-4">Ingresos</th>
                  <th className="py-3">Carga</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {entry.artist_profiles?.artist_name ?? entry.artist_profiles?.legal_name ?? entry.profiles?.email ?? entry.user_id}
                      </p>
                      <code className="text-xs text-muted-foreground">{entry.user_id}</code>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <p>{entry.releases?.title ?? "Sin lanzamiento"}</p>
                      <p className="text-xs">{entry.song_title ?? ""}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone="muted">{entry.platform}</Badge>
                      {entry.country ? (
                        <span className="ml-2 text-xs text-muted-foreground">{entry.country}</span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <p>{entry.artist_report_periods?.title ?? "Reporte manual"}</p>
                      <p className="text-xs">
                        {entry.artist_report_periods?.period_start ?? "-"} / {entry.artist_report_periods?.period_end ?? "-"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <p>{formatNumber(Number(entry.streams))} reproducciones</p>
                      <p>{formatNumber(Number(entry.views))} vistas</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {formatCurrency(Number(entry.revenue_amount), entry.currency)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={7}>
                      Sin reportes todavía.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
