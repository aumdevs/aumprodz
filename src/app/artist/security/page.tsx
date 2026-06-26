import {
  CheckCircle2,
  Clock3,
  KeyRound,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePaidArtist } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { MfaAuthenticatorPanel } from "./mfa-authenticator-panel";
import { SecurityPasswordForm } from "./security-password-form";

export const dynamic = "force-dynamic";

type LoginEventRow = {
  id: string;
  outcome: "success" | "failure";
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export default async function ArtistSecurityPage() {
  const { supabase, user } = await requirePaidArtist();
  const [
    { data: loginEvents, error: loginEventsError },
    { data: mfaFactors },
  ] = await Promise.all([
    supabase
      .from("login_events")
      .select("id,outcome,reason,ip_address,user_agent,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.auth.mfa.listFactors(),
  ]);

  const events = loginEventsError ? [] : ((loginEvents ?? []) as LoginEventRow[]);
  const latestAccess =
    events.find((event) => event.outcome === "success") ?? events[0] ?? null;
  const verifiedTotpFactors =
    mfaFactors?.totp?.filter((factor) => factor.status === "verified") ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-normal">
          Seguridad de la cuenta
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cambia tu contraseña, activa verificación adicional y revisa tus
          accesos recientes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <KeyRound className="size-5 text-primary" />
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityPasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ShieldCheck className="size-5 text-primary" />
            <CardTitle>Google Authenticator</CardTitle>
          </CardHeader>
          <CardContent>
            <MfaAuthenticatorPanel
              configured={verifiedTotpFactors.length > 0}
              factorCount={verifiedTotpFactors.length}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CheckCircle2 className="size-5 text-primary" />
          <CardTitle>Sesión activa y último acceso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <SessionFact
            label="Cuenta"
            value={user.email ?? "Correo no disponible"}
          />
          <SessionFact
            label="Dispositivo"
            value={describeDevice(latestAccess?.user_agent)}
          />
          <SessionFact
            label="Último acceso"
            value={
              latestAccess
                ? `${formatDateTime(latestAccess.created_at)} / IP ${latestAccess.ip_address ?? "no registrada"}`
                : "Sin acceso registrado"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Clock3 className="size-5 text-primary" />
          <CardTitle>Accesos recientes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {events.length > 0 ? (
            events.map((event) => (
              <AccessEventItem key={event.id} event={event} />
            ))
          ) : (
            <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              Aún no hay accesos registrados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SessionFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AccessEventItem({ event }: { event: LoginEventRow }) {
  const success = event.outcome === "success";

  return (
    <div className="grid gap-4 rounded-md border border-border p-4 text-sm md:grid-cols-[1fr_180px_180px] md:items-center">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-md bg-muted">
          <MonitorSmartphone className="size-4 text-primary" />
        </span>
        <div>
          <p className="font-semibold text-foreground">
            {success ? "Acceso correcto" : "Intento fallido"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {describeDevice(event.user_agent)}
          </p>
          {event.reason ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Motivo: {event.reason}
            </p>
          ) : null}
        </div>
      </div>

      <div className="text-muted-foreground">
        <p className="font-semibold text-foreground">Fecha</p>
        <p>{formatDateTime(event.created_at)}</p>
      </div>

      <div className="text-muted-foreground">
        <p className="font-semibold text-foreground">IP</p>
        <p>{event.ip_address ?? "No registrada"}</p>
      </div>
    </div>
  );
}

function describeDevice(userAgent?: string | null) {
  if (!userAgent) {
    return "Dispositivo no registrado";
  }

  if (/macintosh|mac os x/i.test(userAgent)) {
    return "Mac";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/iphone|ipad|ios/i.test(userAgent)) {
    return "iPhone / iPad";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Dispositivo no identificado";
}
