export const ROLES = {
  superAdmin: "super_admin",
  admin: "admin",
  moderator: "moderator",
  analyst: "analyst",
  support: "support",
  companyOwner: "company_owner",
  companyManager: "company_manager",
  user: "user",

  // Alias legacy del panel anterior. Se mantiene para no romper datos antiguos.
  backoffice: "backoffice",
  adminCompany: "admin_company",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_PANEL_ROLES: AppRole[] = [
  ROLES.companyOwner,
  ROLES.companyManager,
  ROLES.adminCompany,
];

export const BACKOFFICE_ROLES: AppRole[] = [
  ROLES.superAdmin,
  ROLES.admin,
  ROLES.moderator,
  ROLES.analyst,
  ROLES.support,
  ROLES.backoffice,
];

export const ALL_STAFF_ROLES: AppRole[] = [
  ROLES.superAdmin,
  ROLES.admin,
  ROLES.moderator,
  ROLES.analyst,
  ROLES.support,
  ROLES.companyOwner,
  ROLES.companyManager,
  ROLES.adminCompany,
  ROLES.backoffice,
];
