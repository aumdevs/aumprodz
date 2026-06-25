"use client";

import { useActionState } from "react";
import { CheckCircle2, QrCode, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  enrollAuthenticatorAction,
  verifyAuthenticatorAction,
  type MfaEnrollmentState,
  type MfaVerificationState,
} from "./actions";

const initialEnrollmentState: MfaEnrollmentState = {};
const initialVerificationState: MfaVerificationState = {};

type MfaAuthenticatorPanelProps = {
  configured: boolean;
  factorCount: number;
};

export function MfaAuthenticatorPanel({
  configured,
  factorCount,
}: MfaAuthenticatorPanelProps) {
  const [enrollment, enrollAction, enrolling] = useActionState(
    enrollAuthenticatorAction,
    initialEnrollmentState,
  );
  const [verification, verifyAction, verifying] = useActionState(
    verifyAuthenticatorAction,
    initialVerificationState,
  );
  const activeFactorId = enrollment.factorId;
  const showSetup = Boolean(activeFactorId && enrollment.qrCode);
  const qrCodeSrc = enrollment.qrCode
    ? getQrCodeSrc(enrollment.qrCode)
    : null;
  const connected = configured || Boolean(verification.success);

  return (
    <div className="grid gap-4 text-sm">
      <div className="rounded-md border border-border bg-muted p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">
              Google Authenticator
            </p>
            <p className="mt-1 text-muted-foreground">
              {connected
                ? `${factorCount || 1} factor conectado.`
                : "Opcional: protege tu cuenta con un código de 6 dígitos."}
            </p>
          </div>
          {connected ? (
            <CheckCircle2 className="size-5 text-emerald-600" />
          ) : (
            <ShieldCheck className="size-5 text-primary" />
          )}
        </div>
      </div>

      {verification.success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-100 p-3 text-sm font-medium text-emerald-800">
          {verification.success}
        </div>
      ) : null}
      {enrollment.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {enrollment.error}
        </div>
      ) : null}
      {verification.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {verification.error}
        </div>
      ) : null}

      {!connected && !showSetup ? (
        <form action={enrollAction}>
          <Button type="submit" variant="secondary" disabled={enrolling}>
            <QrCode className="size-5" />
            {enrolling ? "Preparando..." : "Configurar factor"}
          </Button>
        </form>
      ) : null}

      {!connected && showSetup ? (
        <div className="grid gap-4 rounded-md border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div className="flex items-center justify-center rounded-md border border-border bg-white p-3">
              {qrCodeSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Código QR para Google Authenticator"
                  className="size-32"
                  src={qrCodeSrc}
                />
              ) : null}
            </div>
            <div className="grid content-start gap-2">
              <p className="font-semibold text-foreground">
                Escanea este QR con Google Authenticator.
              </p>
              <p className="text-muted-foreground">
                Si no puedes escanear, agrega esta clave manual:
              </p>
              <code className="break-all rounded-md border border-border bg-muted px-3 py-2 text-xs">
                {enrollment.secret}
              </code>
            </div>
          </div>

          <form action={verifyAction} className="grid gap-3">
            <input name="factor_id" type="hidden" value={activeFactorId} />
            <label className="grid gap-2 font-medium">
              Código de verificación
              <Input
                inputMode="numeric"
                maxLength={6}
                name="code"
                placeholder="123456"
              />
            </label>
            <Button type="submit" disabled={verifying}>
              {verifying ? "Verificando..." : "Verificar y activar"}
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function getQrCodeSrc(value: string) {
  return value.trim().startsWith("<svg")
    ? `data:image/svg+xml;utf8,${encodeURIComponent(value)}`
    : value;
}
