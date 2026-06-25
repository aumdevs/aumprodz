"use client";

import { useActionState, useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dictionaries";
import {
  sendPasswordResetAction,
  signInWithPasswordAction,
  type LoginActionState,
  type PasswordResetRequestState,
} from "./actions";

const initialState: LoginActionState = {};
const initialResetState: PasswordResetRequestState = {};

export function LoginForm({
  locale,
  nextPath,
}: {
  locale: AppLocale;
  nextPath: string;
}) {
  const [state, formAction, pending] = useActionState(
    signInWithPasswordAction,
    initialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    sendPasswordResetAction,
    initialResetState,
  );
  const [showReset, setShowReset] = useState(false);
  const resetEmail = resetState.values?.email ?? state.values?.email ?? "";

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        {state.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            {t(locale, "login.email")}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            defaultValue={state.values?.email ?? ""}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            {t(locale, "login.password")}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? t(locale, "login.submitting") : t(locale, "login.submit")}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setShowReset((current) => !current)}
        className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
      >
        {t(locale, "login.forgot")}
      </button>

      {showReset || resetState.error || resetState.success ? (
        <form
          action={resetAction}
          className="space-y-3 rounded-md border border-border bg-muted p-4"
        >
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              {t(locale, "login.resetHelp")}
            </p>
          </div>
          {resetState.error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {resetState.error}
            </div>
          ) : null}
          {resetState.success ? (
            <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
              {resetState.success}
            </div>
          ) : null}
          <Input
            name="reset_email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            defaultValue={resetEmail}
          />
          <Button
            className="w-full"
            type="submit"
            variant="secondary"
            disabled={resetPending}
          >
            {resetPending
              ? t(locale, "login.resetSubmitting")
              : t(locale, "login.resetSubmit")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
