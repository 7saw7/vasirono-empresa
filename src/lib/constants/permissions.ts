import { ROLES, type AppRole } from "@/lib/constants/roles";

export const ADMIN_COMPANY_PERMISSIONS = [
  "viewDashboard",
  "viewAnalytics",
  "manageCompany",
  "manageBranches",
  "manageReviews",
  "manageSettings",
  "viewVerifications",
  "requestVerification",
  "submitVerification",
  "manageBilling",
  "managePromotions",
  "manageMedia",
  "viewTeam",
  "manageTeam",
] as const;

export type AdminCompanyPermission = (typeof ADMIN_COMPANY_PERMISSIONS)[number];

const FULL_ADMIN_COMPANY_PERMISSIONS: AdminCompanyPermission[] = [
  "viewDashboard",
  "viewAnalytics",
  "manageCompany",
  "manageBranches",
  "manageReviews",
  "manageSettings",
  "viewVerifications",
  "requestVerification",
  "submitVerification",
  "manageBilling",
  "managePromotions",
  "manageMedia",
  "viewTeam",
  "manageTeam",
];

const READ_ONLY_ADMIN_COMPANY_PERMISSIONS: AdminCompanyPermission[] = [
  "viewDashboard",
  "viewAnalytics",
  "viewVerifications",
];

const ROLE_PERMISSION_MAP: Record<AppRole, AdminCompanyPermission[]> = {
  [ROLES.superAdmin]: FULL_ADMIN_COMPANY_PERMISSIONS,
  [ROLES.admin]: FULL_ADMIN_COMPANY_PERMISSIONS,
  [ROLES.moderator]: READ_ONLY_ADMIN_COMPANY_PERMISSIONS,
  [ROLES.analyst]: ["viewDashboard", "viewAnalytics"],
  [ROLES.support]: READ_ONLY_ADMIN_COMPANY_PERMISSIONS,
  [ROLES.companyOwner]: FULL_ADMIN_COMPANY_PERMISSIONS,
  [ROLES.companyManager]: FULL_ADMIN_COMPANY_PERMISSIONS.filter(
    (permission) => permission !== "manageTeam",
  ),
  [ROLES.user]: [],

  // Roles legacy del panel anterior.
  [ROLES.backoffice]: FULL_ADMIN_COMPANY_PERMISSIONS,
  [ROLES.adminCompany]: FULL_ADMIN_COMPANY_PERMISSIONS,
};

export function hasPermission(
  role: AppRole,
  permission: AdminCompanyPermission,
): boolean {
  return ROLE_PERMISSION_MAP[role]?.includes(permission) ?? false;
}
