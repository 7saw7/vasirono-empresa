export const ROLES = {
  superAdmin: "super_admin",
  backoffice: "backoffice",
  adminCompany: "admin_company",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_PANEL_ROLES: AppRole[] = [ROLES.adminCompany];
export const BACKOFFICE_ROLES: AppRole[] = [ROLES.backoffice, ROLES.superAdmin];
export const ALL_STAFF_ROLES: AppRole[] = [
  ROLES.adminCompany,
  ROLES.backoffice,
  ROLES.superAdmin,
];