import {
  BarChart3,
  CheckCircle2,
  DollarSign,
  Eye,
  Headphones,
  Music2,
  Radio,
  TrendingUp,
  Video,
} from "lucide-react";
import type React from "react";

import { ReleaseStatusStepper } from "@/components/artist/release-status-stepper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getArtistReleaseStatusLabel,
  getReleaseStatusTone,
  getReleaseTypeLabel,
  hiddenReleaseStatuses,
} from "@/lib/artist-releases";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { requirePaidArtist } from "@/lib/permissions";
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

const dashboardCopyByLocale: Record<
  AppLocale,
  {
    noData: string;
    noReportsYet: string;
    reportedViews: string;
    adminLoadedData: string;
    reportedStreams: string;
    realReportSum: string;
    latestReport: string;
    reportsWillAppear: string;
    reportedRevenue: string;
    revenueDeclared: string;
    activeReleases: string;
    published: (count: string) => string;
    uploadedFiles: string;
    uploadedFilesDetail: string;
    leadingPlatform: string;
    playsOrViews: (count: string) => string;
    videosWithViews: string;
    viewsByAdmin: string;
    latestUploadedRelease: string;
    byArtist: (artist: string | null) => string;
    created: string;
    noReleases: string;
    mostListened: string;
    song: string;
    video: string;
    platform: string;
    streams: (count: string) => string;
    views: (count: string) => string;
    total: (count: string) => string;
    artistReports: string;
    release: string;
    period: string;
    metrics: string;
    revenue: string;
    generalReport: string;
    careerTitle: string;
    careerText: string;
    latestFlow: string;
    checklistTitle: string;
    checklistItems: string[];
  }
> = {
  ht: {
    noData: "San done",
    noReportsYet: "Pa gen rapò ankò.",
    reportedViews: "Vizyalizasyon rapòte",
    adminLoadedData: "Done administrasyon an chaje.",
    reportedStreams: "Koute rapòte",
    realReportSum: "Som rapò reyèl yo resevwa.",
    latestReport: "Dènye rapò",
    reportsWillAppear: "Lè admin chaje rapò, yo ap parèt isit la.",
    reportedRevenue: "Revni rapòte",
    revenueDeclared: "Revni ki deklare nan rapò yo.",
    activeReleases: "Lansman aktif",
    published: (count) => `${count} pibliye.`,
    uploadedFiles: "Fichye chaje",
    uploadedFilesDetail: "Audio, videyo, portada, pawòl oswa dokiman.",
    leadingPlatform: "Platfòm ki pi fò",
    playsOrViews: (count) => `${count} koute oswa vizyalizasyon.`,
    videosWithViews: "Videyo ak vizyalizasyon",
    viewsByAdmin: "Vizyalizasyon administrasyon an rapòte.",
    latestUploadedRelease: "Dènye lansman ou voye",
    byArtist: (artist) => `pa ${artist ?? ""}`,
    created: "Kreye",
    noReleases: "Ou poko voye okenn lansman.",
    mostListened: "Pi plis koute",
    song: "Chante",
    video: "Videyo",
    platform: "Platfòm",
    streams: (count) => `${count} koute`,
    views: (count) => `${count} vizyalizasyon`,
    total: (count) => `${count} total`,
    artistReports: "Rapò atistik",
    release: "Lansman",
    period: "Peryòd",
    metrics: "Metrik",
    revenue: "Revni",
    generalReport: "Rapò jeneral",
    careerTitle: "Sistèm operasyon karyè atis ou.",
    careerText:
      "Swiv lansman, dosye, kontra, rapò ak pwochen etap ou yo nan yon sèl espas pwofesyonèl.",
    latestFlow: "Pwogrè dènye lansman",
    checklistTitle: "Sa ki pi enpòtan kounye a",
    checklistItems: [
      "Pwofil atis mete ajou",
      "Dosye lansman yo chaje",
      "Kontra ak verifikasyon klè",
    ],
  },
  es: {
    noData: "Sin datos",
    noReportsYet: "Sin reportes todavía.",
    reportedViews: "Vistas reportadas",
    adminLoadedData: "Datos cargados por administración.",
    reportedStreams: "Reproducciones reportadas",
    realReportSum: "Suma de reportes reales recibidos.",
    latestReport: "Último reporte",
    reportsWillAppear: "Cuando admin cargue reportes, aparecerán aquí.",
    reportedRevenue: "Ingresos reportados",
    revenueDeclared: "Ingresos declarados en reportes.",
    activeReleases: "Lanzamientos activos",
    published: (count) => `${count} publicados.`,
    uploadedFiles: "Archivos subidos",
    uploadedFilesDetail: "Audio, video, portada, letra o documento.",
    leadingPlatform: "Plataforma líder",
    playsOrViews: (count) => `${count} reproducciones o vistas.`,
    videosWithViews: "Videos con vistas",
    viewsByAdmin: "Vistas reportadas por administración.",
    latestUploadedRelease: "Último lanzamiento subido",
    byArtist: (artist) => `por ${artist ?? ""}`,
    created: "Creado",
    noReleases: "Todavía no hay lanzamientos enviados.",
    mostListened: "Más escuchado",
    song: "Canción",
    video: "Video",
    platform: "Plataforma",
    streams: (count) => `${count} reproducciones`,
    views: (count) => `${count} vistas`,
    total: (count) => `${count} total`,
    artistReports: "Reportes artísticos",
    release: "Lanzamiento",
    period: "Periodo",
    metrics: "Métricas",
    revenue: "Ingresos",
    generalReport: "Reporte general",
    careerTitle: "Tu sistema operativo de carrera artística.",
    careerText:
      "Sigue lanzamientos, archivos, contratos, reportes y próximos pasos desde un espacio profesional.",
    latestFlow: "Progreso del último lanzamiento",
    checklistTitle: "Lo más importante ahora",
    checklistItems: [
      "Perfil artístico actualizado",
      "Archivos de lanzamiento subidos",
      "Contrato y verificación en regla",
    ],
  },
  en: {
    noData: "No data",
    noReportsYet: "No reports yet.",
    reportedViews: "Reported views",
    adminLoadedData: "Data uploaded by administration.",
    reportedStreams: "Reported streams",
    realReportSum: "Total from real reports received.",
    latestReport: "Latest report",
    reportsWillAppear: "When admin uploads reports, they will appear here.",
    reportedRevenue: "Reported revenue",
    revenueDeclared: "Revenue declared in reports.",
    activeReleases: "Active releases",
    published: (count) => `${count} published.`,
    uploadedFiles: "Uploaded files",
    uploadedFilesDetail: "Audio, video, cover, lyrics or document.",
    leadingPlatform: "Leading platform",
    playsOrViews: (count) => `${count} streams or views.`,
    videosWithViews: "Videos with views",
    viewsByAdmin: "Views reported by administration.",
    latestUploadedRelease: "Latest uploaded release",
    byArtist: (artist) => `by ${artist ?? ""}`,
    created: "Created",
    noReleases: "No releases submitted yet.",
    mostListened: "Most listened",
    song: "Song",
    video: "Video",
    platform: "Platform",
    streams: (count) => `${count} streams`,
    views: (count) => `${count} views`,
    total: (count) => `${count} total`,
    artistReports: "Artist reports",
    release: "Release",
    period: "Period",
    metrics: "Metrics",
    revenue: "Revenue",
    generalReport: "General report",
    careerTitle: "Your artist career operating system.",
    careerText:
      "Track releases, files, contracts, reports and next steps from one professional workspace.",
    latestFlow: "Latest release progress",
    checklistTitle: "Most important right now",
    checklistItems: [
      "Artist profile updated",
      "Release files uploaded",
      "Contract and verification in order",
    ],
  },
  fr: {
    noData: "Aucune donnée",
    noReportsYet: "Aucun rapport pour le moment.",
    reportedViews: "Vues reportées",
    adminLoadedData: "Données chargées par l'administration.",
    reportedStreams: "Écoutes reportées",
    realReportSum: "Somme des rapports réels reçus.",
    latestReport: "Dernier rapport",
    reportsWillAppear: "Quand l'admin chargera des rapports, ils apparaîtront ici.",
    reportedRevenue: "Revenus reportés",
    revenueDeclared: "Revenus déclarés dans les rapports.",
    activeReleases: "Sorties actives",
    published: (count) => `${count} publiées.`,
    uploadedFiles: "Fichiers chargés",
    uploadedFilesDetail: "Audio, vidéo, pochette, paroles ou document.",
    leadingPlatform: "Plateforme principale",
    playsOrViews: (count) => `${count} écoutes ou vues.`,
    videosWithViews: "Vidéos avec vues",
    viewsByAdmin: "Vues reportées par l'administration.",
    latestUploadedRelease: "Dernière sortie envoyée",
    byArtist: (artist) => `par ${artist ?? ""}`,
    created: "Créé",
    noReleases: "Aucune sortie envoyée pour le moment.",
    mostListened: "Le plus écouté",
    song: "Chanson",
    video: "Vidéo",
    platform: "Plateforme",
    streams: (count) => `${count} écoutes`,
    views: (count) => `${count} vues`,
    total: (count) => `${count} total`,
    artistReports: "Rapports artistiques",
    release: "Sortie",
    period: "Période",
    metrics: "Métriques",
    revenue: "Revenus",
    generalReport: "Rapport général",
    careerTitle: "Votre système d'exploitation de carrière artistique.",
    careerText:
      "Suivez sorties, fichiers, contrats, rapports et prochaines étapes dans un espace professionnel.",
    latestFlow: "Progression de la dernière sortie",
    checklistTitle: "Le plus important maintenant",
    checklistItems: [
      "Profil artistique à jour",
      "Fichiers de sortie chargés",
      "Contrat et vérification en ordre",
    ],
  },
  pt: {
    noData: "Sem dados",
    noReportsYet: "Ainda não há relatórios.",
    reportedViews: "Visualizações reportadas",
    adminLoadedData: "Dados carregados pela administração.",
    reportedStreams: "Reproduções reportadas",
    realReportSum: "Soma de relatórios reais recebidos.",
    latestReport: "Último relatório",
    reportsWillAppear: "Quando o admin carregar relatórios, eles aparecerão aqui.",
    reportedRevenue: "Receita reportada",
    revenueDeclared: "Receita declarada nos relatórios.",
    activeReleases: "Lançamentos ativos",
    published: (count) => `${count} publicados.`,
    uploadedFiles: "Arquivos enviados",
    uploadedFilesDetail: "Áudio, vídeo, capa, letra ou documento.",
    leadingPlatform: "Plataforma líder",
    playsOrViews: (count) => `${count} reproduções ou visualizações.`,
    videosWithViews: "Vídeos com visualizações",
    viewsByAdmin: "Visualizações reportadas pela administração.",
    latestUploadedRelease: "Último lançamento enviado",
    byArtist: (artist) => `por ${artist ?? ""}`,
    created: "Criado",
    noReleases: "Ainda não há lançamentos enviados.",
    mostListened: "Mais ouvido",
    song: "Música",
    video: "Vídeo",
    platform: "Plataforma",
    streams: (count) => `${count} reproduções`,
    views: (count) => `${count} visualizações`,
    total: (count) => `${count} total`,
    artistReports: "Relatórios artísticos",
    release: "Lançamento",
    period: "Período",
    metrics: "Métricas",
    revenue: "Receita",
    generalReport: "Relatório geral",
    careerTitle: "Seu sistema operacional de carreira artística.",
    careerText:
      "Acompanhe lançamentos, arquivos, contratos, relatórios e próximos passos em um espaço profissional.",
    latestFlow: "Progresso do último lançamento",
    checklistTitle: "Mais importante agora",
    checklistItems: [
      "Perfil artístico atualizado",
      "Arquivos do lançamento enviados",
      "Contrato e verificação em ordem",
    ],
  },
};

export default async function ArtistDashboardPage() {
  const locale = await getCurrentLocale();
  const copy = dashboardCopyByLocale[locale] ?? dashboardCopyByLocale.ht;
  const { supabase, user } = await requirePaidArtist();
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
      : { platform: copy.noData, plays: 0 };
  const latestReport = artistReports[0] ?? null;
  const releaseStatusOrder = [
    "draft",
    "submitted",
    "under_review",
    "needs_changes",
    "approved",
    "published",
  ];
  const currentStatusIndex = Math.max(
    0,
    releaseStatusOrder.indexOf(latestRelease?.status ?? "draft"),
  );
  const stepperItems = releaseStatusOrder.map((status, index) => ({
    label: getArtistReleaseStatusLabel(status, locale),
    state:
      index < currentStatusIndex
        ? "done"
        : index === currentStatusIndex
          ? "current"
          : "pending",
  })) as React.ComponentProps<typeof ReleaseStatusStepper>["items"];

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="glass-panel rounded-xl p-6 sm:p-8">
          <Badge tone="info">Artist Career OS</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
            {copy.careerTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {copy.careerText}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {copy.checklistItems.map((item) => (
              <div
                className="flex items-center gap-2 rounded-md border border-border bg-background/70 p-3 text-sm font-semibold"
                key={item}
              >
                <CheckCircle2 className="size-4 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{copy.latestFlow}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReleaseStatusStepper items={stepperItems} />
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Eye}
          label={copy.reportedViews}
          value={formatNumber(reportTotals.views)}
          detail={
            artistReports.length > 0
              ? copy.adminLoadedData
              : copy.noReportsYet
          }
        />
        <MetricCard
          icon={Headphones}
          label={copy.reportedStreams}
          value={formatNumber(reportTotals.streams)}
          detail={
            artistReports.length > 0
              ? copy.realReportSum
              : copy.noReportsYet
          }
        />
        <MetricCard
          icon={TrendingUp}
          label={copy.latestReport}
          value={latestReport ? latestReport.platform : copy.noData}
          detail={
            latestReport
              ? formatDateTime(latestReport.created_at)
              : copy.reportsWillAppear
          }
        />
        <MetricCard
          icon={DollarSign}
          label={copy.reportedRevenue}
          value={formatCurrency(reportTotals.revenue, "USD")}
          detail={
            artistReports.length > 0
              ? copy.revenueDeclared
              : copy.noReportsYet
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Music2}
          label={copy.activeReleases}
          value={formatNumber(visibleReleases.length)}
          detail={copy.published(formatNumber(publishedCount))}
        />
        <MetricCard
          icon={Radio}
          label={copy.uploadedFiles}
          value={formatNumber(uploadedFiles.length)}
          detail={copy.uploadedFilesDetail}
        />
        <MetricCard
          icon={BarChart3}
          label={copy.leadingPlatform}
          value={leadingPlatform.platform}
          detail={copy.playsOrViews(formatNumber(leadingPlatform.plays))}
        />
        <MetricCard
          icon={Video}
          label={copy.videosWithViews}
          value={formatNumber(reportTotals.views)}
          detail={copy.viewsByAdmin}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <Music2 className="size-5 text-primary" />
            <CardTitle>{copy.latestUploadedRelease}</CardTitle>
          </CardHeader>
          <CardContent>
            {latestRelease ? (
              <div className="grid gap-3 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{latestRelease.title}</p>
                    <p className="text-muted-foreground">
                      {getReleaseTypeLabel(latestRelease.release_type, locale)}{" "}
                      {copy.byArtist(latestRelease.primary_artist)}
                    </p>
                  </div>
                  <Badge tone={getReleaseStatusTone(latestRelease.status)}>
                    {getArtistReleaseStatusLabel(latestRelease.status, locale)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {copy.created}: {formatDateTime(latestRelease.created_at)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {copy.noReleases}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Headphones className="size-5 text-primary" />
            <CardTitle>{copy.mostListened}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <StatRow
              label={copy.song}
              value={latestReport?.song_title ?? latestAudioRelease?.title ?? copy.noData}
              metric={copy.streams(formatNumber(reportTotals.streams))}
            />
            <StatRow
              label={copy.video}
              value={latestVideoRelease?.title ?? copy.noData}
              metric={copy.views(formatNumber(reportTotals.views))}
            />
            <StatRow
              label={copy.platform}
              value={leadingPlatform.platform}
              metric={copy.total(formatNumber(leadingPlatform.plays))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <BarChart3 className="size-5 text-primary" />
          <CardTitle>{copy.artistReports}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">{copy.release}</th>
                  <th className="py-3 pr-4">{copy.platform}</th>
                  <th className="py-3 pr-4">{copy.period}</th>
                  <th className="py-3 pr-4">{copy.metrics}</th>
                  <th className="py-3">{copy.revenue}</th>
                </tr>
              </thead>
              <tbody>
                {artistReports.map((report) => (
                  <tr key={report.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {report.releases?.title ?? report.song_title ?? copy.generalReport}
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
                      <p>{copy.streams(formatNumber(Number(report.streams)))}</p>
                      <p>{copy.views(formatNumber(Number(report.views)))}</p>
                    </td>
                    <td className="py-3 font-semibold">
                      {formatCurrency(Number(report.revenue_amount), report.currency)}
                    </td>
                  </tr>
                ))}
                {artistReports.length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
                      {copy.noReportsYet}
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
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-[var(--haiti-blue)]" />
      <CardHeader>
        <span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary">
          <Icon className="size-5" />
        </span>
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
  )[0] ?? ["", 0];

  return { platform, plays };
}
