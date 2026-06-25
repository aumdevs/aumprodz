import { NextResponse } from "next/server";

import { artistSmallFilesBucket, formatFileSize } from "@/lib/artist-files";
import { createArtistSupportMessage } from "@/lib/artist-support";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const maxSupportFileSize = 25 * 1024 * 1024;
const allowedSupportFileTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type UploadFileLike = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name?: string;
  size: number;
  type?: string;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const serviceSupabase = createServiceSupabaseClient();

  if (!supabase || !serviceSupabase) {
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

  const formData = await request.formData().catch(() => null);
  const fileEntry = formData?.get("file");

  if (!isUploadFileLike(fileEntry)) {
    return NextResponse.json({ error: "Archivo inválido." }, { status: 400 });
  }

  const file = fileEntry;
  const contentType = file.type || "application/octet-stream";

  if (!allowedSupportFileTypes.includes(contentType)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG, PDF, TXT o DOCX." },
      { status: 415 },
    );
  }

  if (file.size > maxSupportFileSize) {
    return NextResponse.json(
      { error: "El archivo supera 25 MB." },
      { status: 413 },
    );
  }

  const fileName = file.name || "archivo";
  const storageKey = buildSupportFileStorageKey({
    userId: user.id,
    fileName,
  });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await serviceSupabase.storage
    .from(artistSmallFilesBucket)
    .upload(storageKey, bytes, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 503 });
  }

  const result = await createArtistSupportMessage({
    user,
    body: `Archivo adjunto: ${fileName} (${formatFileSize(file.size)})`,
    messageType: "file",
    rawPayload: {
      attachment: {
        bucket: artistSmallFilesBucket,
        storage_key: storageKey,
        original_filename: fileName,
        content_type: contentType,
        size_bytes: file.size,
      },
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json({ message: result.message });
}

function buildSupportFileStorageKey({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `artists/${userId}/support/${crypto.randomUUID()}-${safeName}`;
}

function isUploadFileLike(value: unknown): value is UploadFileLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "size" in value &&
    typeof value.size === "number"
  );
}
