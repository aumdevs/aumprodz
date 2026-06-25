"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";

type RolePermissionRow = {
  id: string;
  label: string;
  description: string;
  permissions: {
    id: string;
    label: string;
  }[];
};

type RolePermissionsTableProps = {
  roles: RolePermissionRow[];
};

export function RolePermissionsTable({ roles }: RolePermissionsTableProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "");
  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  if (roles.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted p-5 text-sm text-muted-foreground">
        Todavía no hay roles configurados.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Seleccionar rol
        <select
          className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          onChange={(event) => setSelectedRoleId(event.target.value)}
          value={selectedRoleId}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.label}
            </option>
          ))}
        </select>
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 pr-4">Rol</th>
              <th className="py-3">Lo que puede hacer</th>
            </tr>
          </thead>
          <tbody>
            {selectedRole ? (
              <tr className="border-b border-border/70 align-top">
                <td className="w-72 py-4 pr-4">
                  <p className="font-semibold">{selectedRole.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {selectedRole.description}
                  </p>
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.permissions.map((permission) => (
                      <Badge key={permission.id} tone="muted">
                        {permission.label}
                      </Badge>
                    ))}
                    {selectedRole.permissions.length === 0 ? (
                      <span className="text-muted-foreground">
                        Sin permisos asignados.
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
