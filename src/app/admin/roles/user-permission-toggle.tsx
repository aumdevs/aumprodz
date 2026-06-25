"use client";

import { useFormStatus } from "react-dom";

import { updateUserPermissionOverrideAction } from "@/app/admin/roles/actions";
import { cn } from "@/lib/utils";

type UserPermissionToggleProps = {
  userId: string;
  permissionId: string;
  label: string;
  enabled: boolean;
  roleIncluded: boolean;
  overrideState: "allow" | "deny" | null;
};

export function UserPermissionToggle({
  enabled,
  label,
  overrideState,
  permissionId,
  roleIncluded,
  userId,
}: UserPermissionToggleProps) {
  const stateLabel =
    overrideState === "allow"
      ? "Extra"
      : overrideState === "deny"
        ? "Bloqueado"
        : roleIncluded
          ? "Por rol"
          : "Sin acceso";

  return (
    <form action={updateUserPermissionOverrideAction}>
      <input name="user_id" type="hidden" value={userId} />
      <input name="permission_id" type="hidden" value={permissionId} />
      <input name="role_included" type="hidden" value={String(roleIncluded)} />
      <label
        className={cn(
          "flex min-h-16 cursor-pointer items-start gap-3 rounded-md border bg-background p-3 transition-colors",
          enabled
            ? "border-primary/40"
            : "border-border bg-muted/35 text-muted-foreground",
        )}
      >
        <input
          aria-label={label}
          className="mt-1 size-4 accent-primary"
          defaultChecked={enabled}
          name="enabled"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          type="checkbox"
          value="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-5">{label}</span>
          <PermissionState label={stateLabel} state={overrideState} enabled={enabled} />
        </span>
      </label>
    </form>
  );
}

function PermissionState({
  enabled,
  label,
  state,
}: {
  enabled: boolean;
  label: string;
  state: "allow" | "deny" | null;
}) {
  const { pending } = useFormStatus();

  return (
    <span
      className={cn(
        "mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
        pending
          ? "bg-muted text-muted-foreground"
          : state === "allow"
            ? "bg-accent/20 text-accent-foreground"
            : state === "deny"
              ? "bg-destructive/10 text-destructive"
              : enabled
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
      )}
    >
      {pending ? "Guardando..." : label}
    </span>
  );
}
