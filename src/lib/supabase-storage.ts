import { artistSmallFilesBucket } from "@/lib/artist-files";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function createSupabaseSignedUploadUrl(key: string) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(artistSmallFilesBucket)
    .createSignedUploadUrl(key, { upsert: false });

  if (error || !data?.signedUrl) {
    return null;
  }

  return data;
}

export async function createSupabaseSignedDownloadUrl(input: {
  key: string;
  expiresIn?: number;
  download?: boolean | string;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(artistSmallFilesBucket)
    .createSignedUrl(input.key, input.expiresIn ?? 300, {
      download: input.download,
    });

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
