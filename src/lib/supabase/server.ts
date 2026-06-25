import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import {
  getEnv,
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL")!,
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies. Route handlers and
            // server actions still refresh the session through the same helper.
          }
        },
      },
    },
  );
}

export function createServiceSupabaseClient() {
  if (!isSupabaseServiceConfigured()) {
    return null;
  }

  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL")!,
    getEnv("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
