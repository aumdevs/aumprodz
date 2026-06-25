import { NextResponse } from "next/server";

import { getAdminReportsData } from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";

export const runtime = "nodejs";

const allowedTypes = [
  "leads",
  "payments",
  "artists",
  "releases",
  "tickets",
  "contracts",
  "artist_reports",
] as const;

type ExportType = (typeof allowedTypes)[number];

export async function GET(request: Request) {
  await requirePermission("reports.export", "/admin/reports");
  const url = new URL(request.url);
  const type = normalizeType(url.searchParams.get("type"));

  if (!type) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  const report = await getAdminReportsData({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  });
  const csv = buildCsv(type, report.rows);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="aum-prodz-${type}.csv"`,
    },
  });
}

function normalizeType(value: string | null): ExportType | null {
  return allowedTypes.includes(value as ExportType) ? (value as ExportType) : null;
}

function buildCsv(type: ExportType, rows: Awaited<ReturnType<typeof getAdminReportsData>>["rows"]) {
  if (type === "leads") {
    return toCsv(
      ["id", "service_slug", "source", "page_path", "country", "created_at"],
      rows.clicks.map((item) => ({
        id: item.id,
        service_slug: item.service_slug,
        source: item.source,
        page_path: item.page_path,
        country: item.country,
        created_at: item.created_at,
      })),
    );
  }

  if (type === "payments") {
    return toCsv(
      ["id", "email", "product_key", "amount_total", "currency", "status", "created_at"],
      rows.payments.map((item) => ({
        id: item.id,
        email: item.profiles?.email,
        product_key: item.product_key,
        amount_total: item.amount_total,
        currency: item.currency,
        status: item.status,
        created_at: item.created_at,
      })),
    );
  }

  if (type === "artists") {
    return toCsv(
      ["id", "email", "artist_name", "status", "identity_status", "contract_status", "created_at"],
      rows.artists.map((item) => ({
        id: item.id,
        email: item.profiles?.email,
        artist_name: item.artist_name,
        status: item.status,
        identity_status: item.identity_status,
        contract_status: item.contract_status,
        created_at: item.created_at,
      })),
    );
  }

  if (type === "releases") {
    return toCsv(
      ["id", "email", "release_type", "title", "status", "created_at"],
      rows.releases.map((item) => ({
        id: item.id,
        email: item.profiles?.email,
        release_type: item.release_type,
        title: item.title,
        status: item.status,
        created_at: item.created_at,
      })),
    );
  }

  if (type === "tickets") {
    return toCsv(
      ["id", "contact", "status", "priority", "subject", "created_at"],
      rows.tickets.map((item) => ({
        id: item.id,
        contact: item.sendpulse_contacts?.email ?? item.sendpulse_contacts?.phone,
        status: item.status,
        priority: item.priority,
        subject: item.subject,
        created_at: item.created_at,
      })),
    );
  }

  if (type === "artist_reports") {
    return toCsv(
      [
        "id",
        "artist_email",
        "artist_name",
        "release",
        "song_title",
        "platform",
        "country",
        "period_start",
        "period_end",
        "streams",
        "views",
        "revenue_amount",
        "currency",
        "created_at",
      ],
      rows.artistReports.map((item) => ({
        id: item.id,
        artist_email: item.profiles?.email,
        artist_name:
          item.artist_profiles?.artist_name ?? item.artist_profiles?.legal_name,
        release: item.releases?.title,
        song_title: item.song_title,
        platform: item.platform,
        country: item.country,
        period_start: item.artist_report_periods?.period_start,
        period_end: item.artist_report_periods?.period_end,
        streams: item.streams,
        views: item.views,
        revenue_amount: item.revenue_amount,
        currency: item.currency,
        created_at: item.created_at,
      })),
    );
  }

  return toCsv(
    ["id", "provider", "title", "status", "signer_email", "created_at"],
    rows.contracts.map((item) => ({
      id: item.id,
      provider: item.provider,
      title: item.title,
      status: item.status,
      signer_email: item.signer_email,
      created_at: item.created_at,
    })),
  );
}

function toCsv(headers: string[], rows: Array<Record<string, unknown>>) {
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(","),
    ),
  ].join("\n");
}

function csvCell(value: unknown) {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}
