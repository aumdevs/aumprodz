"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitContactMessageAction,
  type ContactMessageState,
} from "./actions";

const initialState: ContactMessageState = {};

export type ContactMessageFormCopy = {
  contextLabel: string;
  contextPlaceholder: string;
  emailLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  submit: string;
  submitting: string;
};

export function ContactMessageForm({
  copy,
}: {
  copy: ContactMessageFormCopy;
}) {
  const [state, formAction, pending] = useActionState(
    submitContactMessageAction,
    initialState,
  );
  const values = state.values ?? {};

  return (
    <form action={formAction} className="grid gap-5">
      {state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="flex gap-3 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {state.success}
        </div>
      ) : null}

      <Field
        label={copy.nameLabel}
        name="name"
        defaultValue={values.name}
        error={state.fieldErrors?.name}
        placeholder={copy.namePlaceholder}
        autoComplete="name"
      />
      <Field
        label={copy.emailLabel}
        name="email"
        type="email"
        defaultValue={values.email}
        error={state.fieldErrors?.email}
        placeholder="tu@email.com"
        autoComplete="email"
      />
      <Field
        label={copy.contextLabel}
        name="context"
        defaultValue={values.context}
        error={state.fieldErrors?.context}
        placeholder={copy.contextPlaceholder}
      />
      <label className="grid gap-2 text-sm font-medium">
        {copy.messageLabel}
        <textarea
          name="message"
          defaultValue={values.message ?? ""}
          placeholder={copy.messagePlaceholder}
          className={
            state.fieldErrors?.message
              ? "min-h-40 rounded-md border border-destructive bg-card px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-destructive/20"
              : "min-h-40 rounded-md border border-border bg-card px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          }
        />
        {state.fieldErrors?.message ? (
          <span className="text-xs font-normal text-destructive">
            {state.fieldErrors.message}
          </span>
        ) : null}
      </label>

      <Button type="submit" size="lg" disabled={pending}>
        <Send className="size-5" />
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={error ? "border-destructive" : ""}
      />
      {error ? (
        <span className="text-xs font-normal text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
