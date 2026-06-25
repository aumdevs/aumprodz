import { NextResponse } from "next/server";

import { sendContractWithSignNow } from "@/lib/legal";
import { requirePermission } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user } = await requirePermission("contracts.manage", "/admin/contracts");

  try {
    const result = await sendContractWithSignNow({
      contractId: id,
      actorId: user.id,
    });

    return NextResponse.json({
      sent: true,
      contractId: result.contractId,
      signingUrl: result.signingUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not send signNow contract.",
      },
      { status: 503 },
    );
  }
}
