"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requestIdentityVerification } from "@/lib/legal";
import { requireArtist } from "@/lib/permissions";

export async function requestIdentityVerificationAction() {
  const { user } = await requireArtist();
  let verificationUrl: string | null | undefined;

  try {
    const result = await requestIdentityVerification({
      userId: user.id,
      actorId: user.id,
    });

    verificationUrl = result.verificationUrl;
  } catch {
    redirect("/artist/verification?status=missing_didit");
  }

  revalidatePath("/artist");
  revalidatePath("/artist/verification");

  if (verificationUrl) {
    redirect(verificationUrl);
  }

  redirect("/artist/verification?status=requested");
}
