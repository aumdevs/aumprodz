import { LockKeyhole, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  haitianDiasporaCountryOptions,
  musicGenreOptions,
  phoneCountryCodeOptions,
} from "@/lib/artist-options";
import { requirePaidArtist } from "@/lib/permissions";
import { updateArtistProfileAction } from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Perfil guardado correctamente.",
  missing: "Nombre legal y nombre artístico son obligatorios.",
  error: "No se pudo guardar el perfil.",
  configuration: "Supabase service role no está configurado.",
};

export default async function ArtistProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const { supabase, user } = await requirePaidArtist();
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("legal_name,artist_name,country,phone,bio,genre")
    .eq("user_id", user.id)
    .maybeSingle();
  const phoneParts = parsePhone(profile?.phone);

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="accent">Perfil</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          Perfil artístico
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Estos datos se usan para preparar lanzamientos y revisión interna.
        </p>
      </div>

      {status && messages[status] ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {messages[status]}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <UserRound className="size-5 text-primary" />
          <CardTitle>Datos principales</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateArtistProfileAction} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium md:col-span-2">
                Correo de la cuenta
                <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
                  <LockKeyhole className="size-4" />
                  <span>{user.email ?? "Correo no disponible"}</span>
                </div>
              </label>
              <Field label="Nombre legal" name="legal_name" defaultValue={profile?.legal_name} />
              <Field label="Nombre artístico" name="artist_name" defaultValue={profile?.artist_name} />
              <SelectField
                label="País"
                name="country"
                defaultValue={profile?.country}
                options={haitianDiasporaCountryOptions}
              />
              <PhoneField
                defaultCode={phoneParts.code}
                defaultNumber={phoneParts.number}
              />
              <SelectField
                label="Género musical"
                name="genre"
                defaultValue={profile?.genre}
                options={musicGenreOptions}
              />
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Biografía
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <Button type="submit" className="w-full sm:w-auto">
              Guardar perfil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PhoneField({
  defaultCode,
  defaultNumber,
}: {
  defaultCode: string;
  defaultNumber: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Teléfono
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <select
          name="phone_country_code"
          defaultValue={defaultCode}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          {phoneCountryCodeOptions.map((option) => (
            <option key={`${option.country}-${option.code}`} value={option.code}>
              {option.code} {option.country}
            </option>
          ))}
        </select>
        <Input
          name="phone_number"
          defaultValue={defaultNumber}
          inputMode="tel"
          placeholder="Número"
        />
      </div>
    </label>
  );
}

function parsePhone(value?: string | null) {
  const phone = value?.trim() ?? "";
  const match = phoneCountryCodeOptions.find(
    (option) => option.code !== "+" && phone.startsWith(option.code),
  );

  if (!phone) {
    return { code: "+509", number: "" };
  }

  if (match) {
    return {
      code: match.code,
      number: phone.slice(match.code.length).trim(),
    };
  }

  return {
    code: "+509",
    number: phone.replace(/^\+?509\s*/, ""),
  };
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Input name={name} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: readonly string[];
}) {
  const value =
    defaultValue && options.includes(defaultValue) ? defaultValue : options[0];

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
