"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ResetPasswordState = {
  error?: string;
};

export async function updatePasswordAction(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener mínimo 8 caracteres." };
  }

  if (password !== confirmation) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      error:
        "Supabase aun no esta configurado. Revisa las variables de entorno.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Abre el enlace de recuperación desde tu correo para crear una contraseña nueva.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error:
        "No se pudo actualizar la contraseña. Pide un enlace nuevo e intenta otra vez.",
    };
  }

  redirect("/login?reason=password_updated");
}
