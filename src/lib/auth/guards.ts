import { redirect } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { canAccessAdminCompany } from "./permissions";
import { getSession } from "./session";

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect(PUBLIC_ROUTES.LOGIN);
  }

  return session;
}

export async function requireAdminCompanyAccess() {
  const session = await requireAuth();

  if (!canAccessAdminCompany(session.user.role)) {
    redirect(PUBLIC_ROUTES.LOGIN);
  }

  return session;
}