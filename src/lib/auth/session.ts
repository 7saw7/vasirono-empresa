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
    const currentSession = await getCurrentSessionFromAuthService({ rawToken });
    const principal = currentSession.principal;

    if (!principal) return null;

    return {
      userId: principal.user.id,
      name: principal.user.name,
      email: principal.user.email,
      companyId: principal.activeCompanyId,
      role: principal.activeRole,
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
