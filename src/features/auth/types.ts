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
};

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};