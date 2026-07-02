import { cookies } from "next/headers";
import { AppError } from "@/lib/errors/app-error";
import type { AppRole } from "@/lib/constants/roles";
import {
  getCurrentSessionFromAuthService,
  type AuthServiceLoginResult,
} from "@/lib/auth/auth-service-client";

export const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE_NAME?.trim() || "vasirono_auth_session";

export const REFRESH_COOKIE_NAME =
  process.env.AUTH_REFRESH_COOKIE_NAME?.trim() || "vasirono_auth_refresh";

export const ACTIVE_COMPANY_COOKIE_NAME =
  process.env.AUTH_ACTIVE_COMPANY_COOKIE_NAME?.trim() ||
  "vasirono_active_company_id";

const DEFAULT_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  userId: string;
  name: string;
  email: string;
  companyId: number | null;
  role: AppRole;
  sessionId: number | null;
  expiresAt: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const rawToken = await getRawSessionToken();

  if (!rawToken) return null;

  try {
    const preferredCompanyId = await getActiveCompanyIdFromCookie();
    const currentSession = await getCurrentSessionFromAuthService({
      rawToken,
      ...(preferredCompanyId ? { companyId: preferredCompanyId } : {}),
    });
    const principal = currentSession.principal;

    if (!principal) return null;

    const activeMembership = resolveActiveCompanyMembership(
      principal,
      preferredCompanyId
    );

    return {
      userId: principal.user.id,
      name: principal.user.name,
      email: principal.user.email,
      companyId: activeMembership?.companyId ?? principal.activeCompanyId ?? null,
      role: activeMembership?.role ?? principal.activeRole,
      sessionId: currentSession.session.sessionId,
      expiresAt: currentSession.session.expiresAt,
    };
  } catch (error) {
    if (error instanceof AppError && error.status < 500) {
      return null;
    }

    throw error;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    throw new AppError("UNAUTHORIZED", "No autorizado.", 401);
  }

  return session;
}

export async function getRawSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getRawRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function setAuthServiceSessionCookies(
  result: AuthServiceLoginResult
): Promise<void> {
  const cookieStore = await cookies();
  const sessionExpiresAt = parseExpiresAt(result.session.expiresAt);

  cookieStore.set(SESSION_COOKIE_NAME, result.session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: getCookieSameSite(),
    path: "/",
    ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
    ...(sessionExpiresAt ? { expires: sessionExpiresAt } : {}),
  });

  cookieStore.set(REFRESH_COOKIE_NAME, result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: getCookieSameSite(),
    path: "/",
    ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
    maxAge: getRefreshCookieMaxAgeSeconds(),
  });

  const companyId = resolvePrincipalCompanyId(result.principal);

  if (companyId) {
    cookieStore.set(ACTIVE_COMPANY_COOKIE_NAME, String(companyId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: getCookieSameSite(),
      path: "/",
      ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
      ...(sessionExpiresAt ? { expires: sessionExpiresAt } : {}),
    });
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const baseOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: getCookieSameSite(),
    path: "/",
    ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
    expires: new Date(0),
  } as const;

  cookieStore.set(SESSION_COOKIE_NAME, "", baseOptions);
  cookieStore.set(REFRESH_COOKIE_NAME, "", baseOptions);
  cookieStore.set(ACTIVE_COMPANY_COOKIE_NAME, "", baseOptions);
}


async function getActiveCompanyIdFromCookie(): Promise<number | undefined> {
  const cookieStore = await cookies();
  return parsePositiveInt(cookieStore.get(ACTIVE_COMPANY_COOKIE_NAME)?.value);
}

function resolvePrincipalCompanyId(
  principal: AuthServiceLoginResult["principal"] | null | undefined
): number | undefined {
  if (!principal) return undefined;

  const activeCompanyId = parsePositiveInt(principal.activeCompanyId);

  if (activeCompanyId) return activeCompanyId;

  const activeMembership = principal.memberships?.find((item) => item.isActive);
  return parsePositiveInt(activeMembership?.companyId);
}

function resolveActiveCompanyMembership(
  principal: AuthServiceLoginResult["principal"],
  preferredCompanyId?: number
) {
  const memberships = principal.memberships ?? [];

  if (preferredCompanyId) {
    const preferred = memberships.find(
      (item) => item.companyId === preferredCompanyId && item.isActive
    );

    if (preferred) return preferred;
  }

  if (principal.activeCompanyId) {
    const active = memberships.find(
      (item) => item.companyId === principal.activeCompanyId && item.isActive
    );

    if (active) return active;
  }

  return memberships.find((item) => item.isActive);
}

function parsePositiveInt(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseExpiresAt(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRefreshCookieMaxAgeSeconds(): number {
  const raw = process.env.AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS?.trim();
  const parsed = Number(raw);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return DEFAULT_REFRESH_TTL_SECONDS;
}

function getCookieDomain(): string | undefined {
  return process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
}

function getCookieSameSite(): "lax" | "strict" | "none" {
  const raw = process.env.AUTH_COOKIE_SAME_SITE?.trim().toLowerCase();

  if (raw === "strict") return "strict";
  if (raw === "none") return "none";

  return "lax";
}
