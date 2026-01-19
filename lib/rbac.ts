import type { Role } from "@/models/user";

export type Permission =
  | "services:read"
  | "services:write"
  | "services:control"
  | "services:logs"
  | "settings:read"
  | "settings:write"
  | "users:manage"
  | "metrics:read"
  | "pm2:apply"
  | "docs:read";

export type AuthUser = {
  id: string;
  username: string;
  role: Role;
  serviceScopes: string[];
  permissions: Permission[] | ["*"];
};

export const ROLE_PERMISSIONS: Record<Role, Permission[] | ["*"]> = {
  admin: ["*"],
  operator: [
    "services:read",
    "services:write",
    "services:control",
    "services:logs",
    "settings:read",
    "metrics:read",
    "pm2:apply",
    "docs:read",
  ],
  viewer: ["services:read", "services:logs", "settings:read", "metrics:read", "docs:read"],
};

export function permissionsForRole(role: Role): Permission[] | ["*"] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(user: AuthUser | null, permission: Permission) {
  if (!user) return false;
  return user.permissions.includes("*") || user.permissions.includes(permission);
}

export function isServiceAllowed(user: AuthUser | null, serviceName: string) {
  if (!user) return false;
  if (!user.serviceScopes || user.serviceScopes.length === 0) return true;
  return user.serviceScopes.includes(serviceName);
}
