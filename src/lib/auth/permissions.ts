import { ROLES, type RoleCode } from "@/lib/constants/roles";

const ADMIN_COMPANY_ALLOWED_ROLES: RoleCode[] = [
  ROLES.COMPANY_ADMIN,
  ROLES.COMPANY_STAFF,
];

export function canAccessAdminCompany(role?: string | null): boolean {
  if (!role) return false;
  return ADMIN_COMPANY_ALLOWED_ROLES.includes(role as RoleCode);
}