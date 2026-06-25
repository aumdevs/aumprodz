"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getAppBaseUrl } from "@/lib/env";
import { recordLoginEvent } from "@/lib/login-events";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/utils";

const adminRoles = [
  "super_admin",
  "support",
  "artist_manager",
  "content_editor",
  "finance",
  "analyst",
];

type RoleJoin = {
  roles: { key?: string } | { key?: string }[] | null;
};

export type LoginActionState = {
  error?: string;
  values?: {
    email?: string;
  };
};

export type PasswordResetRequestState = {
  error?: string;
  success?: string;
  values?: {
    email?: string;
  };
};

export async function signInWithPasswordAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const nextPath = sanitizeNextPath(formData.get("next"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      error:
        "Supabase aun no esta configurado. Agrega las variables de entorno antes de iniciar sesion.",
      values: { email },
    };
  }

  if (!email || !password) {
    return {
      error: "Completa email y contraseña.",
      values: { email },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await recordLoginEvent({
      email,
      outcome: "failure",
      reason: "password",
      metadata: {
        status: error.status ?? null,
        message: error.message ?? null,
      },
    });

    return {
      error: getAuthErrorMessage(error),
      values: { email },
    };
  }

  const destination = await getPostLoginDestination({
    nextPath,
    supabase,
    userId: data.user?.id,
  });

  await recordLoginEvent({
    userId: data.user?.id ?? null,
    email: data.user?.email ?? email,
    outcome: "success",
    reason: "password",
    metadata: {
      destination,
      nextPath,
    },
  });

  redirect(destination);
}

export async function sendPasswordResetAction(
  _previousState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("reset_email") ?? "").trim().toLowerCase();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      error:
        "Supabase aun no esta configurado. Agrega las variables de entorno antes de enviar el enlace.",
      values: { email },
    };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      error: "Escribe el correo de tu cuenta artista.",
      values: { email },
    };
  }

  const redirectTo = `${getAppBaseUrl()}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("Supabase password reset failed", {
      status: error.status ?? null,
      code: error.code ?? null,
      message: error.message ?? null,
      redirectTo,
    });

    return {
      error: getPasswordResetErrorMessage(error),
      values: { email },
    };
  }

  return {
    success:
      "Te enviamos un enlace para crear una contraseña nueva. Revisa tu correo.",
    values: { email },
  };
}

function getAuthErrorMessage(error: { message?: string; status?: number }) {
  if (error.status === 429) {
    return "Demasiados intentos. Espera un momento y vuelve a probar.";
  }

  return "Usuario no encontrado o contrasena incorrecta.";
}

function getPasswordResetErrorMessage(error: {
  code?: string;
  message?: string;
  status?: number;
}) {
  const message = error.message?.toLowerCase() ?? "";

  if (
    error.status === 429 ||
    message.includes("rate limit") ||
    message.includes("security purposes") ||
    message.includes("too many")
  ) {
    return "Supabase limito los correos por seguridad. Espera 1 minuto y vuelve a pedir el enlace.";
  }

  if (
    message.includes("redirect") ||
    message.includes("not allowed") ||
    message.includes("url")
  ) {
    return "La URL de recuperacion no esta autorizada en Supabase. Revisa las Redirect URLs y vuelve a intentar.";
  }

  return "No se pudo enviar el enlace. Revisa la configuracion de correo de Supabase e intenta de nuevo.";
}

async function getPostLoginDestination({
  nextPath,
  supabase,
  userId,
}: {
  nextPath: string;
  supabase: SupabaseClient;
  userId?: string;
}) {
  if (nextPath !== "/") {
    return nextPath;
  }

  if (!userId) {
    return "/";
  }

  const [{ data: roles }, { data: profile }, { data: artistProfile }] =
    await Promise.all([
      supabase.from("user_roles").select("roles(key)").eq("user_id", userId),
      supabase
        .from("profiles")
        .select("user_type,status")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("artist_profiles")
        .select("id,status")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const roleKeys = ((roles ?? []) as RoleJoin[])
    .map((row) => {
      if (Array.isArray(row.roles)) {
        return row.roles[0]?.key;
      }

      return row.roles?.key;
    })
    .filter((role): role is string => Boolean(role));

  if (roleKeys.some((role) => adminRoles.includes(role))) {
    return "/admin";
  }

  if (
    roleKeys.includes("artist") ||
    profile?.user_type === "artist" ||
    artistProfile
  ) {
    return "/artist";
  }

  return "/";
}
