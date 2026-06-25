"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getEnv, isSupabaseConfigured } from "@/lib/env";

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL")!,
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
  );
}
