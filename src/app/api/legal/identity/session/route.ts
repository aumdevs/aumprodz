import { NextResponse } from "next/server";

import { requestIdentityVerification } from "@/lib/legal";
import { requirePaidArtist } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST() {
  const { user } = await requirePaidArtist();

  try {
    const result = await requestIdentityVerification({
      userId: user.id,
      actorId: user.id,
    });

    return NextResponse.json({
      status: result.status,
      verificationUrl: result.verificationUrl,
      verificationId: result.verificationId ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create Didit verification session.",
      },
      { status: 503 },
    );
  }
}
