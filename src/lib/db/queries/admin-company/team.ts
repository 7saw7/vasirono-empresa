import { serviceRequest } from "@/lib/http/service-client";
import {
  pick,
  toBoolean,
  toNumber,
  toStringValue,
  unwrapList,
  type AnyRecord,
} from "@/lib/http/service-data";
import { getCurrentPlanQuery } from "@/lib/db/queries/admin-company/billing";
import type { AddTeamMemberInput } from "@/features/admin-company/team/schema";
import type {
  CompanyRoleOption,
  TeamMember,
  TeamOverview,
} from "@/features/admin-company/team/types";

type TeamOverviewContext = {
  currentUserId: string;
  canManageTeam: boolean;
};

const OWNER_ROLE_PREFERENCE = [
  "company_owner",
  "business_owner",
  "admin_company",
];
const MANAGER_ROLE_PREFERENCE = [
  "company_manager",
  "business_manager",
  "business_admin",
];
const ASSIGNABLE_COMPANY_ROLES = new Set([
  ...OWNER_ROLE_PREFERENCE,
  ...MANAGER_ROLE_PREFERENCE,
]);

export async function getTeamOverviewQuery(
  companyId: number,
  context: TeamOverviewContext,
): Promise<TeamOverview> {
  const [members, roles, plan] = await Promise.all([
    listTeamMembersQuery(companyId),
    listCompanyRolesQuery(companyId),
    getCurrentPlanQuery(companyId).catch(() => null),
  ]);

  return {
    members,
    roles,
    teamLimit: plan?.limits.teamMembers ?? null,
    teamManagementEnabled: plan?.features.teamManagement ?? false,
    planLabel: plan?.planName ?? plan?.plan.toUpperCase() ?? "No disponible",
    planAvailable: plan !== null,
    currentUserId: context.currentUserId,
    canManageTeam: context.canManageTeam,
  };
}

export async function listTeamMembersQuery(
  companyId: number,
): Promise<TeamMember[]> {
  const payload = await serviceRequest<unknown>({
    service: "users",
    companyId,
    directPath: `/api/business/companies/${companyId}/users`,
    gatewayPath: `/api/users/api/business/companies/${companyId}/users`,
    errorCode: "TEAM_MEMBERS_ERROR",
    errorMessage: "No se pudo cargar el equipo.",
  });

  return unwrapList(payload, "items", "data", "members", "users").map(
    normalizeMember,
  );
}

export async function listCompanyRolesQuery(
  companyId: number,
): Promise<CompanyRoleOption[]> {
  const payload = await serviceRequest<unknown>({
    service: "users",
    companyId,
    directPath: "/api/business/company-roles",
    gatewayPath: "/api/users/api/business/company-roles",
    errorCode: "TEAM_ROLES_ERROR",
    errorMessage: "No se pudo cargar los roles del equipo.",
  });

  const roles = unwrapList(payload, "items", "data", "roles")
    .map(normalizeRoleOption)
    .filter((role) => ASSIGNABLE_COMPANY_ROLES.has(role.name));

  return deduplicateSemanticRoles(roles);
}

export async function addTeamMemberQuery(
  companyId: number,
  input: AddTeamMemberInput,
) {
  return serviceRequest<unknown, AddTeamMemberInput>({
    service: "users",
    companyId,
    directPath: `/api/business/companies/${companyId}/users`,
    gatewayPath: `/api/users/api/business/companies/${companyId}/users`,
    method: "POST",
    body: input,
    errorCode: "TEAM_MEMBER_CREATE_ERROR",
    errorMessage: "No se pudo agregar el integrante.",
  });
}

export async function updateTeamMemberRoleQuery(
  companyId: number,
  userId: string,
  roleId: number,
) {
  return serviceRequest<unknown, { roleId: number }>({
    service: "users",
    companyId,
    directPath: `/api/business/companies/${companyId}/users/${userId}/role`,
    gatewayPath: `/api/users/api/business/companies/${companyId}/users/${userId}/role`,
    method: "PATCH",
    body: { roleId },
    errorCode: "TEAM_MEMBER_ROLE_ERROR",
    errorMessage: "No se pudo actualizar el rol.",
  });
}

export async function setTeamMemberActiveQuery(
  companyId: number,
  userId: string,
  active: boolean,
) {
  return serviceRequest<unknown, { active: boolean }>({
    service: "users",
    companyId,
    directPath: `/api/business/companies/${companyId}/users/${userId}/active`,
    gatewayPath: `/api/users/api/business/companies/${companyId}/users/${userId}/active`,
    method: "PATCH",
    body: { active },
    errorCode: "TEAM_MEMBER_ACTIVE_ERROR",
    errorMessage: "No se pudo cambiar el estado del integrante.",
  });
}

function normalizeMember(row: AnyRecord): TeamMember {
  return {
    membershipId: toNumber(pick(row, "membershipId", "membership_id", "id")),
    companyId: toNumber(pick(row, "companyId", "company_id")),
    userId: toStringValue(pick(row, "userId", "user_id")),
    userName: toStringValue(
      pick(row, "userName", "user_name", "name"),
      "Usuario",
    ),
    userEmail: toStringValue(pick(row, "userEmail", "user_email", "email"), ""),
    userPhone:
      pick(row, "userPhone", "user_phone") == null
        ? null
        : String(pick(row, "userPhone", "user_phone")),
    roleId: toNumber(pick(row, "roleId", "role_id")),
    roleName: toStringValue(pick(row, "roleName", "role_name"), "role"),
    isActive: toBoolean(pick(row, "isActive", "is_active"), true),
    createdAt:
      pick(row, "createdAt", "created_at") == null
        ? null
        : String(pick(row, "createdAt", "created_at")),
    updatedAt:
      pick(row, "updatedAt", "updated_at") == null
        ? null
        : String(pick(row, "updatedAt", "updated_at")),
  };
}

function normalizeRoleOption(row: AnyRecord): CompanyRoleOption {
  const name = toStringValue(pick(row, "name"), "role").trim().toLowerCase();

  return {
    roleId: toNumber(pick(row, "roleId", "role_id", "id")),
    name,
    label: humanRoleLabel(name),
  };
}

function deduplicateSemanticRoles(
  roles: CompanyRoleOption[],
): CompanyRoleOption[] {
  const owner = pickPreferredRole(roles, OWNER_ROLE_PREFERENCE);
  const manager = pickPreferredRole(roles, MANAGER_ROLE_PREFERENCE);
  return [owner, manager].filter((role): role is CompanyRoleOption =>
    Boolean(role),
  );
}

function pickPreferredRole(
  roles: CompanyRoleOption[],
  preference: string[],
): CompanyRoleOption | undefined {
  for (const name of preference) {
    const match = roles.find((role) => role.name === name);
    if (match) return match;
  }

  return undefined;
}

function humanRoleLabel(value: string): string {
  const map: Record<string, string> = {
    company_owner: "Propietario",
    business_owner: "Propietario",
    admin_company: "Propietario",
    company_manager: "Manager de empresa",
    business_manager: "Manager de empresa",
    business_admin: "Manager de empresa",
  };

  return map[value] ?? value.replaceAll("_", " ");
}
