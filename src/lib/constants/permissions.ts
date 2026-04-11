import { ROLES, type AppRole } from "@/lib/constants/roles";

export const ADMIN_COMPANY_PERMISSIONS = [
  "viewDashboard",
  "viewAnalytics",
  "manageCompany",
  "manageBranches",
  "manageReviews",
  "manageSettings",
  "viewVerifications",
] as const;

export type AdminCompanyPermission =
  (typeof ADMIN_COMPANY_PERMISSIONS)[number];

const ROLE_PERMISSION_MAP: Record<AppRole, AdminCompanyPermission[]> = {
  [ROLES.superAdmin]: [
    "viewDashboard",
    "viewAnalytics",
    "manageCompany",
    "manageBranches",
    "manageReviews",
    "manageSettings",
    "viewVerifications",
  ],
  [ROLES.backoffice]: [
    "viewDashboard",
    "viewAnalytics",
    "manageCompany",
    "manageBranches",
    "manageReviews",
    "manageSettings",
    "viewVerifications",
  ],
  [ROLES.adminCompany]: [
    "viewDashboard",
    "viewAnalytics",
    "manageCompany",
    "manageBranches",
    "manageReviews",
    "manageSettings",
    "viewVerifications",
  ],
};

export function hasPermission(
  role: AppRole,
  permission: AdminCompanyPermission
): boolean {
  return ROLE_PERMISSION_MAP[role]?.includes(permission) ?? false;
}