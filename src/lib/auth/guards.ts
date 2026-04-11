import { AppError } from "@/lib/errors/app-error";
import { type AppRole } from "@/lib/constants/roles";
import { getSession, requireSession } from "./session";

export async function requireAuth() {
  return requireSession();
}

export async function optionalAuth() {
  return getSession();
}

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.role as AppRole)) {
    throw new AppError("FORBIDDEN", "No tienes permisos para esta acción.", 403);
  }

  return session;
}