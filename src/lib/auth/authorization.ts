import { AppError } from "@/lib/errors/app-error";
import { requireSession, type SessionUser } from "@/lib/auth/session";
import {
  hasPermission,
  type AdminCompanyPermission,
} from "@/lib/constants/permissions";
import { type AppRole } from "@/lib/constants/roles";

export async function requirePermission(
  permission: AdminCompanyPermission
): Promise<SessionUser> {
  const session = await requireSession();

  if (!hasPermission(session.role, permission)) {
    throw new AppError(
      "FORBIDDEN",
      "No tienes permisos para realizar esta acción.",
      403
    );
  }

  return session;
}

export function assertPermission(
  role: AppRole,
  permission: AdminCompanyPermission
): void {
  if (!hasPermission(role, permission)) {
    throw new AppError(
      "FORBIDDEN",
      "No tienes permisos para realizar esta acción.",
      403
    );
  }
}