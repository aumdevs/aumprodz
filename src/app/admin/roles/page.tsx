import {
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

import {
  assignRoleAction,
  createAdminUserAction,
} from "@/app/admin/roles/actions";
import { RolePermissionsTable } from "@/app/admin/roles/role-permissions-table";
import { UserPermissionPanel } from "@/app/admin/roles/user-permission-panel";
import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAdminRolesData,
  type AdminPermissionRecord,
  type AdminRolePermissionRecord,
  type AdminRoleRecord,
  type AdminUserPermissionOverrideRecord,
  type AdminUserRoleRecord,
} from "@/lib/admin/data";
import { requireAnyPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const roleOrder = [
  "super_admin",
  "support",
  "artist_manager",
  "content_editor",
  "finance",
  "analyst",
  "artist",
];

const roleLabels: Record<string, string> = {
  super_admin: "Acceso total",
  support: "Soporte al cliente",
  artist_manager: "Gestión de artistas",
  content_editor: "Contenido y servicios",
  finance: "Pagos y finanzas",
  analyst: "Reportes y estadísticas",
  artist: "Artista",
};

const roleDescriptions: Record<string, string> = {
  super_admin: "Puede administrar todo el panel, usuarios, permisos, pagos, contratos y ajustes.",
  support: "Puede atender casos, revisar mensajes y dar seguimiento a solicitudes.",
  artist_manager: "Puede revisar artistas, identidad, contratos y lanzamientos enviados.",
  content_editor: "Puede actualizar servicios, videos, textos públicos y contenido visible.",
  finance: "Puede ver pagos, suscripciones, productos activos y reportes financieros.",
  analyst: "Puede consultar métricas, actividad, reportes y datos operativos.",
  artist: "Acceso del artista a su propio panel, lanzamientos, contrato y soporte.",
};

const permissionLabels: Record<string, string> = {
  "admin.access": "Entrar al panel administrativo",
  "profiles.read": "Ver perfiles de usuarios",
  "admins.create": "Crear usuarios y asignar roles",
  "roles.manage": "Cambiar permisos del equipo",
  "analytics.read": "Ver estadísticas y reportes",
  "content.manage": "Editar servicios y contenido público",
  "artists.read": "Ver cuentas de artistas",
  "releases.manage": "Revisar música y lanzamientos",
  "payments.read": "Ver pagos y suscripciones",
  "contracts.read": "Ver contratos",
  "contracts.manage": "Gestionar contratos",
  "contracts.send": "Enviar contratos a firma",
  "contracts.upload": "Subir contratos PDF",
  "identity.read_status": "Ver estado de identidad",
  "identity.manage": "Gestionar identidad",
  "artist_files.download": "Descargar archivos de artistas",
  "artist_files.listen": "Escuchar o ver archivos enviados",
  "artist_files.modify": "Cambiar archivos de artistas",
  "webhooks.read": "Ver avisos automáticos",
  "audit_logs.read": "Ver historial de cambios",
  "settings.manage": "Gestionar ajustes del sistema",
  "sendpulse.read": "Ver mensajes de WhatsApp",
  "tickets.manage": "Gestionar casos de soporte",
  "leads.manage": "Ver personas interesadas",
  "operations.kanban": "Mover trabajo por estado",
  "reports.export": "Exportar reportes",
  "alerts.read": "Ver pendientes importantes",
  "billing.manage": "Gestionar productos y precios",
  "service_catalog.manage": "Gestionar catálogo completo",
  "artist_reports.manage": "Cargar reportes artísticos",
};

const statusMessages: Record<
  string,
  { tone: "success" | "error"; message: string }
> = {
  "role-saved": {
    tone: "success",
    message: "Rol asignado correctamente.",
  },
  "user-created": {
    tone: "success",
    message: "Usuario creado y rol asignado correctamente.",
  },
  "user-invited": {
    tone: "success",
    message: "Invitación enviada y rol asignado correctamente.",
  },
  "permission-saved": {
    tone: "success",
    message: "Permiso actualizado correctamente.",
  },
  "user-not-found": {
    tone: "error",
    message: "No encontré ese correo. Puedes crear el usuario nuevo desde el formulario de la derecha.",
  },
  missing: {
    tone: "error",
    message: "Completa los campos necesarios antes de guardar.",
  },
  "password-short": {
    tone: "error",
    message: "La contraseña temporal debe tener al menos 8 caracteres.",
  },
  "create-error": {
    tone: "error",
    message: "No se pudo crear o invitar el usuario. Revisa el correo y la configuración de Supabase.",
  },
  "service-role-missing": {
    tone: "error",
    message: "Falta la llave segura de Supabase para administrar usuarios desde el servidor.",
  },
  "permission-error": {
    tone: "error",
    message: "No se pudo guardar el permiso individual. Revisa que la migración esté aplicada.",
  },
  error: {
    tone: "error",
    message: "No se pudo guardar el cambio. Revisa permisos o configuración.",
  },
};

type UserPermissionState = {
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
  permissions: UserPermissionState[];
};

export default async function AdminRolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  await requireAnyPermission(["admins.create", "roles.manage"], "/admin/roles");
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const {
    roles,
    permissions,
    rolePermissions,
    userRoles,
    userPermissionOverrides,
    errors,
  } = await getAdminRolesData();

  const adminRoles = sortRoles(roles.filter((role) => role.key !== "artist"));
  const visibleRoles = sortRoles(roles);
  const userRows = buildUserRows({
    permissions,
    rolePermissions,
    roles,
    userPermissionOverrides,
    userRoles,
  });
  const roleRows = buildRoleRows({
    permissions,
    rolePermissions,
    roles: visibleRoles,
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Equipo y permisos"
        description="Asigna roles, crea usuarios nuevos e incluye o quita permisos por persona."
      />

      <StatusMessage status={status} />
      <AdminDataAlert errors={errors} />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <Search className="size-5 text-primary" />
            <CardTitle>Asignar rol a usuario existente</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={assignRoleAction}
              className="grid gap-4 md:grid-cols-[1fr_240px_auto] md:items-end"
            >
              <label className="space-y-2 text-sm font-medium">
                Buscar por correo
                <Input
                  name="email"
                  placeholder="persona@email.com"
                  required
                  type="email"
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Rol que tendrá
                <RoleSelect roles={adminRoles} />
              </label>
              <Button type="submit">Asignar rol</Button>
            </form>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Usa esto cuando la cuenta ya existe y solo necesitas darle acceso
              al panel.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <UserPlus className="size-5 text-primary" />
            <CardTitle>Crear usuario nuevo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAdminUserAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Nombre completo
                  <Input
                    name="full_name"
                    placeholder="Nombre y apellido"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Correo
                  <Input
                    name="email"
                    placeholder="persona@email.com"
                    required
                    type="email"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Rol inicial
                  <RoleSelect roles={adminRoles} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Contraseña temporal
                  <Input
                    minLength={8}
                    name="temporary_password"
                    placeholder="Solo si no envías invitación"
                    type="password"
                  />
                </label>
              </div>
              <label className="flex items-start gap-3 rounded-md border border-border bg-background p-3 text-sm">
                <input
                  className="mt-1 size-4 accent-primary"
                  defaultChecked
                  name="send_invite"
                  type="checkbox"
                />
                <span>
                  <span className="font-semibold">Enviar invitación por correo</span>
                  <span className="block leading-6 text-muted-foreground">
                    La persona recibirá el acceso para entrar con su correo.
                    Si desmarcas esto, debes poner una contraseña temporal.
                  </span>
                </span>
              </label>
              <div>
                <Button type="submit">Crear acceso</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <UsersRound className="size-5 text-primary" />
          <CardTitle>Usuario, rol y permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <UserPermissionPanel users={userRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>Roles y lo que pueden hacer</CardTitle>
        </CardHeader>
        <CardContent>
          <RolePermissionsTable roles={roleRows} />
        </CardContent>
      </Card>
    </div>
  );
}

function RoleSelect({ roles }: { roles: AdminRoleRecord[] }) {
  return (
    <select
      className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      name="role_key"
      required
    >
      {roles.map((role) => (
        <option key={role.key} value={role.key}>
          {getRoleLabel(role)}
        </option>
      ))}
    </select>
  );
}

function StatusMessage({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  const result = statusMessages[status] ?? statusMessages.error;
  const isSuccess = result.tone === "success";

  return (
    <Card
      className={
        isSuccess
          ? "border-primary/30 bg-primary/5"
          : "border-destructive/30 bg-destructive/5"
      }
    >
      <CardContent
        className={
          isSuccess
            ? "p-4 text-sm font-medium text-primary"
            : "p-4 text-sm font-medium text-destructive"
        }
      >
        {result.message}
      </CardContent>
    </Card>
  );
}

function buildUserRows({
  permissions,
  rolePermissions,
  roles,
  userPermissionOverrides,
  userRoles,
}: {
  permissions: AdminPermissionRecord[];
  rolePermissions: AdminRolePermissionRecord[];
  roles: AdminRoleRecord[];
  userPermissionOverrides: AdminUserPermissionOverrideRecord[];
  userRoles: AdminUserRoleRecord[];
}) {
  const rolePermissionsByRole = new Map<string, Set<string>>();
  const overridesByUserPermission = new Map<
    string,
    AdminUserPermissionOverrideRecord
  >();
  const rowsByUser = new Map<string, Omit<UserRow, "permissions">>();

  for (const role of roles) {
    rolePermissionsByRole.set(role.id, new Set());
  }

  for (const item of rolePermissions) {
    if (!item.permission_id) {
      continue;
    }

    const permissionsForRole =
      rolePermissionsByRole.get(item.role_id) ?? new Set<string>();
    permissionsForRole.add(item.permission_id);
    rolePermissionsByRole.set(item.role_id, permissionsForRole);
  }

  for (const override of userPermissionOverrides) {
    overridesByUserPermission.set(
      `${override.user_id}:${override.permission_id}`,
      override,
    );
  }

  for (const item of userRoles) {
    const role = firstJoin(item.roles);
    const userRow = rowsByUser.get(item.user_id) ?? {
      userId: item.user_id,
      fullName: item.profiles?.full_name ?? "Sin nombre",
      email: item.profiles?.email ?? item.user_id,
      status: item.profiles?.status ?? "sin estado",
      userType: item.profiles?.user_type ?? "usuario",
      roles: [],
    };

    userRow.roles.push({
      id: item.role_id,
      key: role?.key ?? item.role_id,
      label: getRoleLabel({
        key: role?.key ?? item.role_id,
        name: role?.name ?? role?.key ?? "Rol",
      }),
    });
    rowsByUser.set(item.user_id, userRow);
  }

  return [...rowsByUser.values()].map((row) => {
    const permissionsForUser = permissions.map((permission) => {
      const roleIncluded = row.roles.some((role) =>
        rolePermissionsByRole.get(role.id)?.has(permission.id),
      );
      const override = overridesByUserPermission.get(
        `${row.userId}:${permission.id}`,
      );
      const enabled = override ? override.is_allowed : roleIncluded;
      const overrideState: UserPermissionState["overrideState"] = override
        ? override.is_allowed
          ? "allow"
          : "deny"
        : null;

      return {
        id: permission.id,
        key: permission.key,
        label: getPermissionLabel(permission),
        description: permission.description ?? "",
        roleIncluded,
        enabled,
        overrideState,
      };
    });

    return {
      ...row,
      permissions: permissionsForUser,
    };
  });
}

function getRolePermissions({
  permissionRecords,
  role,
  rolePermissions,
}: {
  permissionRecords: AdminPermissionRecord[];
  role: AdminRoleRecord;
  rolePermissions: AdminRolePermissionRecord[];
}) {
  const permissionsById = new Map(
    permissionRecords.map((permission) => [permission.id, permission]),
  );

  return rolePermissions
    .filter((item) => item.role_id === role.id)
    .map((item) => permissionsById.get(item.permission_id))
    .filter((permission): permission is AdminPermissionRecord =>
      Boolean(permission),
    );
}

function buildRoleRows({
  permissions,
  rolePermissions,
  roles,
}: {
  permissions: AdminPermissionRecord[];
  rolePermissions: AdminRolePermissionRecord[];
  roles: AdminRoleRecord[];
}) {
  return roles.map((role) => ({
    id: role.id,
    label: getRoleLabel(role),
    description: getRoleDescription(role),
    permissions: getRolePermissions({
      permissionRecords: permissions,
      role,
      rolePermissions,
    }).map((permission) => ({
      id: permission.id,
      label: getPermissionLabel(permission),
    })),
  }));
}

function getRoleLabel(role: Pick<AdminRoleRecord, "key" | "name">) {
  return roleLabels[role.key] ?? role.name;
}

function getRoleDescription(role: AdminRoleRecord) {
  return roleDescriptions[role.key] ?? role.description ?? "Rol del equipo.";
}

function getPermissionLabel(
  permission: Pick<AdminPermissionRecord, "key" | "name">,
) {
  return permissionLabels[permission.key] ?? permission.name;
}

function sortRoles(roles: AdminRoleRecord[]) {
  return [...roles].sort((first, second) => {
    const firstIndex = roleOrder.indexOf(first.key);
    const secondIndex = roleOrder.indexOf(second.key);
    const firstRank = firstIndex === -1 ? roleOrder.length : firstIndex;
    const secondRank = secondIndex === -1 ? roleOrder.length : secondIndex;

    return firstRank - secondRank || first.name.localeCompare(second.name);
  });
}

function firstJoin<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
