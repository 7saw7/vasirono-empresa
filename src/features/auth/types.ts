export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: number | null;
};

export type LoginResult = {
  user: AuthUser;
  token: string;
};