"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function RecoverySessionHandler() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase || !window.location.hash) {
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const errorDescription = hashParams.get("error_description");

    if (errorDescription) {
      queueMicrotask(() => {
        setMessage("El enlace no es valido o ya expiro. Pide un enlace nuevo.");
      });
      return;
    }

    if (!accessToken || !refreshToken) {
      return;
    }

    let mounted = true;

    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error }) => {
        if (!mounted) {
          return;
        }

        if (error) {
          setMessage("No se pudo abrir la sesion de recuperacion. Pide un enlace nuevo.");
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
        setMessage("Enlace verificado. Ahora crea tu nueva contraseña.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="mb-5 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
