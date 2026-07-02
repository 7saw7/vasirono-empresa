export type TeamMember = {
  membershipId: number;
  companyId: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CompanyRoleOption = {
  roleId: number;
  name: string;
  label: string;
};

export type TeamOverview = {
  members: TeamMember[];
  roles: CompanyRoleOption[];
  teamLimit: number | null;
  teamManagementEnabled: boolean;
  planLabel: string;
};
