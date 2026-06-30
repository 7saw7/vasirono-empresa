import type { AppRole } from "@/lib/constants/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  companyId: number | null;
  role: AppRole;
};

export type LoginInput = {
  email: string;
  password: string;
  companyId?: number;
};

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};

export type BusinessInvitationPreview = {
  invitationId: string;
  email: string;
  name: string;
  roleCode: string;
  companyId: number;
  companyName: string;
  branchId: number | null;
  branchName: string | null;
  source: "claim" | "registration";
  claimRequestId: number | null;
  registrationRequestId: string | null;
  expiresAt: string;
  account: {
    exists: boolean;
    hasCredentials: boolean;
    isActive: boolean | null;
  };
  activation: {
    canCreateCredentials: boolean;
    requiresExistingLogin: boolean;
  };
};

export type AcceptBusinessInvitationInput = {
  token: string;
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

export type BusinessInvitationAcceptResult = {
  accepted: true;
  invitation: BusinessInvitationPreview;
  user: {
    userId: string;
    email: string;
    name: string;
    created: boolean;
    credentialCreated: boolean;
    existingCredential: boolean;
  };
  companyAccess: {
    companyId: number;
    branchId: number | null;
    roleCode: string;
    granted: true;
    branchAccessGranted: boolean;
  };
  loginRequired: boolean;
};
