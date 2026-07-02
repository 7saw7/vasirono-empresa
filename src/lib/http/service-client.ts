import { AppError } from "@/lib/errors/app-error";
import { getRawSessionToken, getSession } from "@/lib/auth/session";

type ServiceName =
  | "auth"
  | "companies"
  | "branch"
  | "analytics"
  | "reviews"
  | "verifications"
  | "notifications"
  | "billing"
  | "promotions"
  | "media";

type QueryValue = string | number | boolean | null | undefined;

type ServiceRequest<TBody = unknown> = {
  service: ServiceName;
  directPath: string;
  gatewayPath?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: TBody;
  token?: string | null;
  headers?: HeadersInit;
  companyId?: number | null;
  cache?: RequestCache;
  errorCode?: string;
  errorMessage?: string;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = {
  success: false;
  error?: { code?: string; message?: string; details?: unknown };
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

const DEFAULT_GATEWAY_URL = "https://api.vasirono.com";

const SERVICE_ENV_KEYS: Record<ServiceName, string[]> = {
  auth: ["AUTH_SERVICE_URL", "AUTH_SERVICE_INTERNAL_URL"],
  companies: ["COMPANIES_SERVICE_URL", "COMPANIES_SERVICE_INTERNAL_URL"],
  branch: ["BRANCH_SERVICE_URL", "BRANCH_SERVICE_INTERNAL_URL"],
  analytics: ["ANALYTICS_SERVICE_URL", "ANALYTICS_SERVICE_INTERNAL_URL"],
  reviews: ["REVIEWS_SERVICE_URL", "REVIEWS_SERVICE_INTERNAL_URL"],
  verifications: [
    "VERIFICATIONS_SERVICE_URL",
    "VERIFICATIONS_SERVICE_INTERNAL_URL",
  ],
  notifications: [
    "NOTIFICATIONS_SERVICE_URL",
    "NOTIFICATIONS_SERVICE_INTERNAL_URL",
  ],
  billing: ["BILLING_SERVICE_URL", "BILLING_SERVICE_INTERNAL_URL"],
  promotions: ["PROMOTIONS_SERVICE_URL", "PROMOTIONS_SERVICE_INTERNAL_URL"],
  media: ["MEDIA_SERVICE_URL", "MEDIA_SERVICE_INTERNAL_URL"],
};

export async function serviceRequest<TResponse, TBody = unknown>(
  input: ServiceRequest<TBody>
): Promise<TResponse> {
  const token = input.token ?? (await getRawSessionToken());
  const actorHeaders = await buildServerActorHeaders(input.service, input.companyId);
  const url = buildServiceUrl(input);
  const method = input.method ?? "GET";

  const response = await fetch(url, {
    method,
    cache: input.cache ?? "no-store",
    headers: {
      Accept: "application/json",
      ...(input.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...actorHeaders,
      ...input.headers,
    },
    ...(input.body !== undefined ? { body: JSON.stringify(input.body) } : {}),
  });

  const rawText = await response.text();
  const payload = parseJson<ApiResponse<TResponse> | TResponse>(rawText);

  if (!response.ok) {
    const apiError = isApiError(payload) ? payload.error : undefined;

    throw new AppError(
      apiError?.code ||
        input.errorCode ||
        `${input.service.toUpperCase()}_SERVICE_ERROR`,
      apiError?.message ||
        input.errorMessage ||
        "No se pudo completar la operación.",
      response.status || 502
    );
  }

  if (isApiSuccess<TResponse>(payload)) return payload.data;

  if (isApiError(payload)) {
    throw new AppError(
      payload.error?.code ||
        input.errorCode ||
        `${input.service.toUpperCase()}_SERVICE_ERROR`,
      payload.error?.message ||
        input.errorMessage ||
        "No se pudo completar la operación.",
      response.status || 502
    );
  }

  return payload as TResponse;
}

export async function serviceRequestOptional<TResponse, TBody = unknown>(
  input: ServiceRequest<TBody>
): Promise<TResponse | null> {
  try {
    return await serviceRequest<TResponse, TBody>(input);
  } catch {
    return null;
  }
}

export function buildServiceUrl(
  input: Pick<ServiceRequest, "service" | "directPath" | "gatewayPath" | "query">
): string {
  const baseUrl = resolveServiceBaseUrl(input.service);
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const path = isGatewayBaseUrl(normalizedBase)
    ? input.gatewayPath ?? input.directPath
    : input.directPath;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  for (const [key, value] of Object.entries(input.query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function resolveServiceBaseUrl(service: ServiceName): string {
  for (const key of SERVICE_ENV_KEYS[service]) {
    const value = process.env[key]?.trim();

    if (value) return value;
  }

  return (
    process.env.API_GATEWAY_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.VASIRONO_API_URL?.trim() ||
    DEFAULT_GATEWAY_URL
  );
}

function isGatewayBaseUrl(baseUrl: string): boolean {
  const value = baseUrl.toLowerCase();

  return (
    value.includes("api.vasirono.com") ||
    value.includes("origin-gw.vasirono.com") ||
    value === process.env.API_GATEWAY_URL?.replace(/\/+$/, "").toLowerCase()
  );
}


async function buildServerActorHeaders(
  service: ServiceName,
  companyIdOverride?: number | null
): Promise<Record<string, string>> {
  if (service === "auth") return {};

  const session = await getSession();

  if (!session) return {};

  const permissions = resolveCompanyPortalPermissions(session.role);
  const activeCompanyId = companyIdOverride ?? session.companyId;
  const headers: Record<string, string> = {
    "x-user-id": session.userId,
    "x-user-email": session.email,
    "x-user-role": session.role,
    "x-role-name": session.role,
    "x-portal": "company",
  };

  if (activeCompanyId) {
    headers["x-company-id"] = String(activeCompanyId);
    headers["x-company-ids"] = String(activeCompanyId);
  }

  if (permissions.length) {
    headers["x-user-permissions"] = permissions.join(",");
  }

  return headers;
}

function resolveCompanyPortalPermissions(role: string): string[] {
  const companyBasePermissions = [
    "companies.profile.read",
    "companies.profile.update",
    "companies.taxonomy.read",
    "companies.taxonomy.manage",

    "company.branches.read",
    "company.branches.write",
    "company.branch_contacts.read",
    "company.branch_contacts.write",
    "company.branch_schedules.read",
    "company.branch_schedules.write",
    "company.branch_services.read",
    "company.branch_services.write",
    "company.branch_media.read",
    "company.branch_media.write",
    "company.branch_aforo.read",
    "company.branch_aforo.write",

    "analytics.company.read",

    "reviews.business.read",
    "reviews.business.respond",

    "verifications.business.read_own",
    "verifications.business.request",
    "verifications.business.submit",

    "billing.business.read",

    "promotions:business:read",
    "promotions:business:create",
    "promotions:business:update",
    "promotions:business:activate",
    "promotions:business:pause",
    "promotions:business:delete",
    "promotions:business:validate-redemption",

    "media:types:read",
    "media:company:read",
    "media:company:write",
    "media:branch:read",
    "media:branch:write",

    "notifications:read:own",
    "notifications:mark:own",
    "notifications:delete:own",
    "notifications:preferences:manage",
  ];

  const ownerExtras = [
    "companies.users.read",
    "companies.users.manage",
    "company.branch_staff.read",
    "company.branch_staff.write",
    "billing.business.checkout.create",
    "media:company:delete",
    "media:branch:delete",
  ];

  const managerExtras = ["companies.users.read", "company.branch_staff.read"];

  if (["company_owner", "admin_company"].includes(role)) {
    return uniqueStrings([...companyBasePermissions, ...ownerExtras]);
  }

  if (role === "company_manager") {
    return uniqueStrings([...companyBasePermissions, ...managerExtras]);
  }

  if (["super_admin", "admin"].includes(role)) {
    return uniqueStrings([...companyBasePermissions, ...ownerExtras]);
  }

  return [];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function parseJson<T>(text: string): T | null {
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function isApiSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      (payload as { success?: unknown }).success === true &&
      "data" in payload
  );
}

function isApiError(payload: unknown): payload is ApiError {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      (payload as { success?: unknown }).success === false
  );
}
