import { NextResponse } from "next/server";
import { z } from "zod";

import { createArtistSupportMessage } from "@/lib/artist-support";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const messageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no está configurado." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  const result = await createArtistSupportMessage({
    user,
    body: parsed.data.message,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json({ message: result.message });
}
