import { AppError } from "@/lib/errors/app-error";
import { requireSession } from "@/lib/auth/session";
import {
  hasPermission,
  type AdminCompanyPermission,
} from "@/lib/constants/permissions";
import type { AppRole } from "@/lib/constants/roles";

export type CompanyContext = {
  userId: string;
  email: string;
  companyId: number;
  role: AppRole;
};

export async function getCompanyContext(
  requiredPermission?: AdminCompanyPermission
): Promise<CompanyContext> {
  const session = await requireSession();

  if (!session.companyId) {
    throw new AppError(
      "FORBIDDEN",
      "No tienes una empresa asociada.",
      403
    );
  }

  if (requiredPermission && !hasPermission(session.role, requiredPermission)) {
    throw new AppError(
      "FORBIDDEN",
      "No tienes permisos para realizar esta acción.",
      403
    );
  }

  return {
    userId: session.userId,
    email: session.email,
    companyId: session.companyId, // ✅ ya es number
    role: session.role,           // ✅ ya es AppRole
  };
}