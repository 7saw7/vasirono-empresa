import { serviceRequest } from "@/lib/http/service-client";
import { pick, toBoolean, toNumber, toStringValue, unwrapList, type AnyRecord } from "@/lib/http/service-data";
import { getCurrentPlanQuery } from "@/lib/db/queries/admin-company/billing";
import type { CompanyRoleOption, TeamMember, TeamOverview } from "@/features/admin-company/team/types";

export async function getTeamOverviewQuery(companyId: number): Promise<TeamOverview> {
  const [members, roles, plan] = await Promise.all([
    listTeamMembersQuery(companyId),
    listCompanyRolesQuery(companyId),
    getCurrentPlanQuery(companyId).catch(() => null),
  ]);

  return {
    members,
    roles,
    teamLimit: plan?.limits.teamMembers ?? null,
    teamManagementEnabled: Boolean(plan?.features.teamManagement ?? members.length <= 1),
    planLabel: plan?.planName ?? plan?.plan.toUpperCase() ?? "FREE",
  };
}

export async function listTeamMembersQuery(companyId: number): Promise<TeamMember[]> {
  const payload = await serviceRequest<unknown>({
    service: "users",
    companyId,
    directPath: `/api/business/companies/${companyId}/users`,
    gatewayPath: `/api/users/api/business/companies/${companyId}/users`,
    errorCode: "TEAM_MEMBERS_ERROR",
    errorMessage: "No se pudo cargar el equipo.",
  });

  return unwrapList(payload, "items", "data", "members", "users").map(normalizeMember);
}

export async function listCompanyRolesQuery(companyId: number): Promise<CompanyRoleOption[]> {
  const payload = await serviceRequest<unknown>({
    service: "users",
    companyId,
    directPath: "/api/business/company-roles",
    gatewayPath: "/api/users/api/business/company-roles",
    errorCode: "TEAM_ROLES_ERROR",
    errorMessage: "No se pudo cargar los roles del equipo.",
  });

  return unwrapList(payload, "items", "data", "roles").map((row) => ({
    roleId: toNumber(pick(row, "roleId", "role_id", "id")),
    name: toStringValue(pick(row, "name"), "role"),
    label: humanRoleLabel(toStringValue(pick(row, "label", "name"), "Rol")),
  }));
}

export async function addTeamMemberQuery(companyId: number, input: { userEmail?: string; userId?: string; roleId: number }) {
  return serviceRequest<unknown, typeof input>({
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

export async function updateTeamMemberRoleQuery(companyId: number, userId: string, roleId: number) {
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

export async function setTeamMemberActiveQuery(companyId: number, userId: string, active: boolean) {
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
    userName: toStringValue(pick(row, "userName", "user_name", "name"), "Usuario"),
    userEmail: toStringValue(pick(row, "userEmail", "user_email", "email"), ""),
    userPhone: pick(row, "userPhone", "user_phone") == null ? null : String(pick(row, "userPhone", "user_phone")),
    roleId: toNumber(pick(row, "roleId", "role_id")),
    roleName: toStringValue(pick(row, "roleName", "role_name"), "role"),
    isActive: toBoolean(pick(row, "isActive", "is_active"), true),
    createdAt: pick(row, "createdAt", "created_at") == null ? null : String(pick(row, "createdAt", "created_at")),
    updatedAt: pick(row, "updatedAt", "updated_at") == null ? null : String(pick(row, "updatedAt", "updated_at")),
  };
}

function humanRoleLabel(value: string): string {
  const map: Record<string, string> = {
    company_owner: "Propietario",
    business_owner: "Propietario",
    admin_company: "Administrador empresa",
    company_manager: "Manager empresa",
    business_admin: "Administrador empresa",
    branch_manager: "Encargado de sucursal",
    branch_staff: "Staff de sucursal",
  };
  return map[value] ?? value.replaceAll("_", " ");
}
