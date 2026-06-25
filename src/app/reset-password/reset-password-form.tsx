"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Nueva contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="password_confirmation"
          className="text-sm font-medium"
        >
          Confirmar contraseña
        </label>
        <Input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
        />
      </div>
      <Button className="w-full" type="submit" disabled={pending}>
        <KeyRound className="size-5" />
        {pending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
