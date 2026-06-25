"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateArtistPasswordAction,
  type SecurityPasswordState,
} from "./actions";

const initialState: SecurityPasswordState = {};

export function SecurityPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updateArtistPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-100 p-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="size-4" />
          {state.success}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-medium">
        Contraseña actual
        <Input
          name="current_password"
          type="password"
          autoComplete="current-password"
          placeholder="Escribe tu contraseña actual"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Nueva contraseña
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Confirmar nueva contraseña
        <Input
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
        />
      </label>

      <Button className="w-full sm:w-fit" type="submit" disabled={pending}>
        <KeyRound className="size-5" />
        {pending ? "Guardando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
