import { getSession } from "./session";

export type CompanyContext = {
  companyId: number;
  userId: string;
  role: string;
};

export async function getCompanyContext(): Promise<CompanyContext> {
  const session = await getSession();

  if (!session?.user?.companyId) {
    throw new Error("No se encontró el contexto de empresa.");
  }

  return {
    companyId: session.user.companyId,
    userId: session.user.id,
    role: session.user.role,
  };
}