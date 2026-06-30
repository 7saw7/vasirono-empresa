import { AppError } from "@/lib/errors/app-error";
import type { AppRole } from "@/lib/constants/roles";
import type {
  AcceptBusinessInvitationInput,
  BusinessInvitationAcceptResult,
  BusinessInvitationPreview,
  LoginInput,
} from "@/features/auth/types";

const AUTH_SERVICE_DEFAULT_URL =
  "http://auth-service.vasirono.svc.cluster.local:3002";
const AUTH_PORTAL = "company";

export type AuthServiceIdentityUser = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  globalRole: AppRole;
};

export type AuthServiceCompanyMembership = {
  companyId: number;
  role: AppRole;
  isActive: boolean;
};

export type AuthServiceBranchScope = {
  companyId: number;
  branchId: number;
  role: AppRole;
  isActive: boolean;
};

export type AuthServicePrincipal = {
  user: AuthServiceIdentityUser;
  portal: typeof AUTH_PORTAL;
  activeRole: AppRole;
  activeCompanyId: number | null;
  memberships: AuthServiceCompanyMembership[];
  branchScopes: AuthServiceBranchScope[];
};

export type AuthServiceSession = {
  sessionId: number;
  token: string;
  expiresAt: string;
};

export type AuthServiceLoginResult = {
  principal: AuthServicePrincipal;
  session: AuthServiceSession;
  refreshToken: string;
};

export type AuthServiceCurrentSessionResult = {
  principal: AuthServicePrincipal | null;
  session: {
    sessionId: number | null;
    expiresAt: string | null;
  };
};

type AuthServiceApiSuccess<T> = {
  success: true;
  data: T;
};

type AuthServiceApiError = {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type AuthServiceApiResponse<T> = AuthServiceApiSuccess<T> | AuthServiceApiError;

type LoginWithAuthServiceInput = LoginInput & {
  companyId?: number;
};

export async function loginWithAuthService(
  input: LoginWithAuthServiceInput,
  requestHeaders?: Headers
): Promise<AuthServiceLoginResult> {
  const response = await authServiceFetch<AuthServiceLoginResult>("/auth/login", {
    method: "POST",
    headers: buildForwardHeaders(requestHeaders),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      portal: AUTH_PORTAL,
      ...(input.companyId ? { companyId: input.companyId } : {}),
    }),
  });

  return response;
}

export async function getCurrentSessionFromAuthService(input: {
  rawToken: string;
  companyId?: number;
}): Promise<AuthServiceCurrentSessionResult> {
  const searchParams = new URLSearchParams({ portal: AUTH_PORTAL });

  if (input.companyId) {
    searchParams.set("companyId", String(input.companyId));
  }

  return authServiceFetch<AuthServiceCurrentSessionResult>(
    `/auth/me?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${input.rawToken}`,
      },
      cache: "no-store",
    }
  );
}


export async function previewBusinessInvitationWithAuthService(input: {
  token: string;
  requestHeaders?: Headers;
}): Promise<BusinessInvitationPreview> {
  const searchParams = new URLSearchParams({ token: input.token });

  return authServiceFetch<BusinessInvitationPreview>(
    `/auth/business-invitations/preview?${searchParams.toString()}`,
    {
      method: "GET",
      headers: buildForwardHeaders(input.requestHeaders),
      cache: "no-store",
    }
  );
}

export async function acceptBusinessInvitationWithAuthService(
  input: AcceptBusinessInvitationInput,
  requestHeaders?: Headers
): Promise<BusinessInvitationAcceptResult & Partial<AuthServiceLoginResult>> {
  return authServiceFetch<
    BusinessInvitationAcceptResult & Partial<AuthServiceLoginResult>
  >("/auth/business-invitations/accept", {
    method: "POST",
    headers: buildForwardHeaders(requestHeaders),
    body: JSON.stringify({
      token: input.token,
      ...(input.name ? { name: input.name } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.password ? { password: input.password } : {}),
    }),
  });
}

export async function refreshSessionWithAuthService(input: {
  refreshToken: string;
  requestHeaders?: Headers;
}): Promise<AuthServiceLoginResult> {
  return authServiceFetch<AuthServiceLoginResult>("/auth/session/refresh", {
    method: "POST",
    headers: buildForwardHeaders(input.requestHeaders),
    body: JSON.stringify({ refreshToken: input.refreshToken }),
  });
}

export async function logoutFromAuthService(rawToken: string | null): Promise<void> {
  try {
    await authServiceFetch<null>("/auth/logout", {
      method: "POST",
      headers: {
        ...(rawToken ? { Authorization: `Bearer ${rawToken}` } : {}),
      },
    });
  } catch (error) {
    // El logout local debe limpiar cookies incluso si el auth-service ya revocó
    // o expiró la sesión. Los errores de red sí se propagan.
    if (error instanceof AppError && error.status < 500) {
      return;
    }

    throw error;
  }
}

export async function requestPasswordResetWithAuthService(
  email: string,
  requestHeaders?: Headers
): Promise<unknown> {
  return authServiceFetch<unknown>("/auth/forgot-password", {
    method: "POST",
    headers: buildForwardHeaders(requestHeaders),
    body: JSON.stringify({ email }),
  });
}

async function authServiceFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(buildAuthServiceUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let payload: AuthServiceApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as AuthServiceApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const error = payload && "error" in payload ? payload.error : undefined;

    throw new AppError(
      error?.code || "AUTH_SERVICE_ERROR",
      error?.message || "No se pudo completar la operación de autenticación.",
      response.status || 502
    );
  }

  return payload.data;
}

function buildAuthServiceUrl(path: string): string {
  const baseUrl = (
    process.env.AUTH_SERVICE_URL ||
    process.env.AUTH_SERVICE_INTERNAL_URL ||
    AUTH_SERVICE_DEFAULT_URL
  ).replace(/\/$/, "");

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathWithApiPrefix = normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `/api${normalizedPath}`;

  return `${baseUrl}${pathWithApiPrefix}`;
}

function buildForwardHeaders(requestHeaders?: Headers): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(requestHeaders?.get("x-forwarded-for")
      ? { "x-forwarded-for": requestHeaders.get("x-forwarded-for") as string }
      : {}),
    ...(requestHeaders?.get("user-agent")
      ? { "user-agent": requestHeaders.get("user-agent") as string }
      : {}),
  };
}
