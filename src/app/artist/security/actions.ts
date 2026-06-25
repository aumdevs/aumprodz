"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit";
import { requireArtist } from "@/lib/permissions";

export type SecurityPasswordState = {
  error?: string;
  success?: string;
};

export async function updateArtistPasswordAction(
  _previousState: SecurityPasswordState,
  formData: FormData,
): Promise<SecurityPasswordState> {
  const { supabase, user } = await requireArtist();
  const currentPassword = String(formData.get("current_password") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (!currentPassword) {
    return { error: "Escribe tu contraseña actual para poder cambiarla." };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener mínimo 8 caracteres." };
  }

  if (password !== confirmation) {
    return { error: "Las contraseñas no coinciden." };
  }

  if (!user.email) {
    return { error: "No se pudo confirmar el correo de esta cuenta." };
  }

  const { error: verificationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verificationError) {
    await createAuditLog({
      actorId: user.id,
      action: "artist_security.password_update",
      entityType: "profiles",
      entityId: user.id,
      outcome: "failure",
      metadata: {
        source: "artist_security",
        reason: "invalid_current_password",
      },
    });

    return { error: "La contraseña actual no es correcta." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  await createAuditLog({
    actorId: user.id,
    action: "artist_security.password_update",
    entityType: "profiles",
    entityId: user.id,
    outcome: error ? "failure" : "success",
    metadata: {
      source: "artist_security",
    },
  });

  if (error) {
    return { error: "No se pudo actualizar la contraseña." };
  }

  return { success: "Contraseña actualizada correctamente." };
}

export type MfaEnrollmentState = {
  error?: string;
  success?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
};

export type MfaVerificationState = {
  error?: string;
  success?: string;
};

export async function enrollAuthenticatorAction(
  previousState: MfaEnrollmentState,
): Promise<MfaEnrollmentState> {
  void previousState;
  const { supabase, user } = await requireArtist();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "AUM PRODZ Artist",
  });

  await createAuditLog({
    actorId: user.id,
    action: "artist_security.mfa_enroll",
    entityType: "profiles",
    entityId: user.id,
    outcome: error ? "failure" : "success",
    metadata: {
      source: "artist_security",
      factor_type: "totp",
    },
  });

  if (error || !data?.totp) {
    return {
      error:
        "No se pudo preparar Google Authenticator. Revisa la configuración MFA de Supabase.",
    };
  }

  return {
    success: "Escanea el QR y escribe el código para terminar.",
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function verifyAuthenticatorAction(
  _previousState: MfaVerificationState,
  formData: FormData,
): Promise<MfaVerificationState> {
  const { supabase, user } = await requireArtist();
  const factorId = String(formData.get("factor_id") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");

  if (!factorId || !code) {
    return { error: "Escribe el código de 6 dígitos de tu aplicación." };
  }

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });

  if (challengeError || !challenge?.id) {
    return { error: "No se pudo iniciar la verificación del factor." };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  await createAuditLog({
    actorId: user.id,
    action: "artist_security.mfa_verify",
    entityType: "profiles",
    entityId: user.id,
    outcome: error ? "failure" : "success",
    metadata: {
      source: "artist_security",
      factor_type: "totp",
    },
  });

  if (error) {
    return { error: "El código no es correcto o ya expiró." };
  }

  revalidatePath("/artist/security");
  return { success: "Google Authenticator quedó conectado correctamente." };
}
