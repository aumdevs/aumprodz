import {
  BarChart3,
  DollarSign,
  Eye,
  Headphones,
  Music2,
  Radio,
  TrendingUp,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getArtistReleaseStatusLabel,
  getReleaseStatusTone,
  getReleaseTypeLabel,
  hiddenReleaseStatuses,
} from "@/lib/artist-releases";
import { requireArtist } from "@/lib/permissions";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ArtistReportEntry = {
  id: string;
  platform: string;
  streams: number;
  views: number;
  revenue_amount: number;
  currency: string;
  song_title: string | null;
  created_at: string;
  artist_report_periods?: {
    title?: string | null;
    period_start?: string | null;
    period_end?: string | null;
  } | null;
  releases?: {
    title?: string | null;
  } | null;
};

export default async function ArtistDashboardPage() {
  const { supabase, user } = await requireArtist();
  const [{ data: releases }, { data: files }, reportEntriesResult] =
    await Promise.all([
      supabase
        .from("releases")
        .select(
          "id,release_type,title,primary_artist,status,desired_release_date,created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("release_files")
        .select("id,release_id,file_type,storage_provider,status,created_at")
        .eq("status", "uploaded")
        .order("created_at", { ascending: false }),
      supabase
        .from("artist_report_entries")
        .select(
          "id,platform,streams,views,revenue_amount,currency,song_title,created_at,artist_report_periods(title,period_start,period_end),releases(title)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
  const artistReports = ((reportEntriesResult.data ?? []) as ArtistReportEntry[]);
  const visibleReleases = (releases ?? []).filter(
    (release) =>
      !hiddenReleaseStatuses.includes(
        release.status as (typeof hiddenReleaseStatuses)[number],
      ),
  );
  const releaseIds = new Set(visibleReleases.map((release) => release.id));
  const uploadedFiles = (files ?? []).filter(
    (file) => releaseIds.has(file.release_id) && file.storage_provider !== "external",
  );
  const latestRelease = visibleReleases[0] ?? null;
  const latestAudioRelease =
    visibleReleases.find((release) => release.release_type !== "video") ?? null;
  const latestVideoRelease =
    visibleReleases.find((release) => release.release_type === "video") ?? null;
  const publishedCount = visibleReleases.filter(
    (release) => release.status === "published",
  ).length;
  const reportTotals = artistReports.reduce(
    (acc, report) => ({
      streams: acc.streams + Number(report.streams ?? 0),
      views: acc.views + Number(report.views ?? 0),
      revenue: acc.revenue + Number(report.revenue_amount ?? 0),
    }),
    { streams: 0, views: 0, revenue: 0 },
  );
  const leadingPlatform =
    artistReports.length > 0
      ? buildLeadingPlatform(artistReports)
      : { platform: "Sin datos", plays: 0 };
  const latestReport = artistReports[0] ?? null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Eye}
          label="Vistas reportadas"
          value={formatNumber(reportTotals.views)}
          detail={
            artistReports.length > 0
              ? "Datos cargados por administración."
              : "Sin reportes todavía."
          }
        />
        <MetricCard
          icon={Headphones}
          label="Reproducciones reportadas"
          value={formatNumber(reportTotals.streams)}
          detail={
            artistReports.length > 0
              ? "Suma de reportes reales recibidos."
              : "Sin reportes todavía."
          }
        />
        <MetricCard
          icon={TrendingUp}
          label="Último reporte"
          value={latestReport ? latestReport.platform : "Sin datos"}
          detail={
            latestReport
              ? formatDateTime(latestReport.created_at)
              : "Cuando admin cargue reportes, aparecerán aquí."
          }
        />
        <MetricCard
          icon={DollarSign}
          label="Ingresos reportados"
          value={formatCurrency(reportTotals.revenue, "USD")}
          detail={
            artistReports.length > 0
              ? "Ingresos declarados en reportes."
              : "Sin reportes todavía."
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Music2}
          label="Lanzamientos activos"
          value={formatNumber(visibleReleases.length)}
          detail={`${formatNumber(publishedCount)} publicados.`}
        />
        <MetricCard
          icon={Radio}
          label="Archivos subidos"
          value={formatNumber(uploadedFiles.length)}
          detail="Audio, video, portada, letra o documento."
        />
        <MetricCard
          icon={BarChart3}
          label="Plataforma líder"
          value={leadingPlatform.platform}
          detail={`${formatNumber(leadingPlatform.plays)} reproducciones o vistas.`}
        />
        <MetricCard
          icon={Video}
          label="Videos con vistas"
          value={formatNumber(reportTotals.views)}
          detail="Vistas reportadas por administración."
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <Music2 className="size-5 text-primary" />
            <CardTitle>Último lanzamiento subido</CardTitle>
          </CardHeader>
          <CardContent>
            {latestRelease ? (
              <div className="grid gap-3 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{latestRelease.title}</p>
                    <p className="text-muted-foreground">
                      {getReleaseTypeLabel(latestRelease.release_type)} por{" "}
                      {latestRelease.primary_artist}
                    </p>
                  </div>
                  <Badge tone={getReleaseStatusTone(latestRelease.status)}>
                    {getArtistReleaseStatusLabel(latestRelease.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Creado: {formatDateTime(latestRelease.created_at)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no hay lanzamientos enviados.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Headphones className="size-5 text-primary" />
            <CardTitle>Más escuchado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <StatRow
              label="Canción"
              value={latestReport?.song_title ?? latestAudioRelease?.title ?? "Sin datos"}
              metric={`${formatNumber(reportTotals.streams)} reproducciones`}
            />
            <StatRow
              label="Video"
              value={latestVideoRelease?.title ?? "Sin datos"}
              metric={`${formatNumber(reportTotals.views)} vistas`}
            />
            <StatRow
              label="Plataforma"
              value={leadingPlatform.platform}
              metric={`${formatNumber(leadingPlatform.plays)} total`}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <BarChart3 className="size-5 text-primary" />
          <CardTitle>Reportes artísticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Lanzamiento</th>
                  <th className="py-3 pr-4">Plataforma</th>
                  <th className="py-3 pr-4">Periodo</th>
                  <th className="py-3 pr-4">Métricas</th>
                  <th className="py-3">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {artistReports.map((report) => (
                  <tr key={report.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {report.releases?.title ?? report.song_title ?? "Reporte general"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {report.platform}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {report.artist_report_periods?.period_start ?? "-"} /{" "}
                      {report.artist_report_periods?.period_end ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <p>{formatNumber(Number(report.streams))} reproducciones</p>
                      <p>{formatNumber(Number(report.views))} vistas</p>
                    </td>
                    <td className="py-3 font-semibold">
                      {formatCurrency(Number(report.revenue_amount), report.currency)}
                    </td>
                  </tr>
                ))}
                {artistReports.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
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

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function StatRow({
  label,
  value,
  metric,
}: {
  label: string;
  value: string;
  metric: string;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{metric}</p>
    </div>
  );
}

function buildLeadingPlatform(reports: ArtistReportEntry[]) {
  const totals = new Map<string, number>();

  for (const report of reports) {
    totals.set(
      report.platform,
      (totals.get(report.platform) ?? 0) +
        Number(report.streams ?? 0) +
        Number(report.views ?? 0),
    );
  }

  const [platform, plays] = [...totals.entries()].sort(
    (first, second) => second[1] - first[1],
  )[0] ?? ["Sin datos", 0];

  return { platform, plays };
}
