export type AppRole = "ADMIN" | "LEAD";

export const ROLES: Record<AppRole, AppRole> = {
  ADMIN: "ADMIN",
  LEAD: "LEAD",
};

export const DEFAULT_ROLE: AppRole = ROLES.LEAD;
