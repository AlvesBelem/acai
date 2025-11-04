export type AppRole = "SUPERUSER" | "ADMIN" | "LEAD";

export const ROLES: Record<AppRole, AppRole> = {
  SUPERUSER: "SUPERUSER",
  ADMIN: "ADMIN",
  LEAD: "LEAD",
};

export const DEFAULT_ROLE: AppRole = ROLES.LEAD;
