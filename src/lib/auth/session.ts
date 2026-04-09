export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: number | null;
};

export type AppSession = {
  user: SessionUser;
  expiresAt?: string;
};

export async function getSession(): Promise<AppSession | null> {
  /**
   * Placeholder profesional:
   * luego aquí conectaremos cookies/JWT/NextAuth/custom auth.
   */
  return {
    user: {
      id: "demo-user-id",
      email: "empresa@vasirono.com",
      name: "Admin Empresa Demo",
      role: "company_admin",
      companyId: 1,
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };
}