import { NextResponse, type NextRequest } from "next/server";

import {
  getAdminNavBadgeCounts,
  markAdminNavSectionSeen,
} from "@/lib/admin/data";
import { requireAdmin } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  await requireAdmin();

  return NextResponse.json({
    badgeCounts: await getAdminNavBadgeCounts(),
  });
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const payload = (await request.json().catch(() => null)) as {
    pathname?: unknown;
  } | null;
  const pathname =
    typeof payload?.pathname === "string" ? payload.pathname : "/admin";

  await markAdminNavSectionSeen(pathname);

  return NextResponse.json({
    badgeCounts: await getAdminNavBadgeCounts(),
  });
}
