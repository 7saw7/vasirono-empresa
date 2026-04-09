export const ROLES = {
  SUPERADMIN: "superadmin",
  BACKOFFICE: "backoffice",
  COMPANY_ADMIN: "company_admin",
  COMPANY_STAFF: "company_staff",
  USER: "user",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];