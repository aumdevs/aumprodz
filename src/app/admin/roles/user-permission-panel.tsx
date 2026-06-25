"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, KeyRound, ShieldCheck, UsersRound } from "lucide-react";

import { UserPermissionToggle } from "@/app/admin/roles/user-permission-toggle";
import { Badge } from "@/components/ui/badge";

type PermissionState = {
  id: string;
  key: string;
  label: string;
  description: string;
  roleIncluded: boolean;
  enabled: boolean;
  overrideState: "allow" | "deny" | null;
};

type UserRow = {
  userId: string;
  fullName: string;
  email: string;
  status: string;
  userType: string;
  roles: {
    id: string;
    key: string;
    label: string;
  }[];
  permissions: PermissionState[];
};

type UserPermissionPanelProps = {
  users: UserRow[];
};

export function UserPermissionPanel({ users }: UserPermissionPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.userId ?? "");
  const selectedUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  if (users.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted p-5 text-sm text-muted-foreground">
        Todavía no hay usuarios con roles visibles para este panel.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="admin-user-picker">
          Seleccionar usuario
        </label>
        <select
          className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          id="admin-user-picker"
          onChange={(event) => setSelectedUserId(event.target.value)}
          value={selectedUserId}
        >
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.fullName} - {user.email}
            </option>
          ))}
        </select>
      </div>

      {selectedUser ? (
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <UsersRound className="size-5 text-primary" />
                <h3 className="text-xl font-black">{selectedUser.fullName}</h3>
              </div>
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {selectedUser.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedUser.roles.map((role) => (
                <Badge key={role.id}>{role.label}</Badge>
              ))}
              {selectedUser.roles.length === 0 ? (
                <Badge tone="muted">Sin rol</Badge>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
            {selectedUser.permissions.map((permission) => (
              <UserPermissionToggle
                enabled={permission.enabled}
                key={permission.id}
                label={permission.label}
                overrideState={permission.overrideState}
                permissionId={permission.id}
                roleIncluded={permission.roleIncluded}
                userId={selectedUser.userId}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              Por rol: acceso incluido en el cargo.
            </p>
            <p className="flex items-center gap-2">
              <KeyRound className="size-4 text-accent" />
              Extra: permiso agregado solo a esta persona.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-destructive" />
              Bloqueado o sin acceso: no puede usar esa parte.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
