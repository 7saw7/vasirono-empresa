import { AppError } from "@/lib/errors/app-error";
import { getRawSessionToken } from "@/lib/auth/session";

type ServiceName =
  | "auth"
  | "companies"
  | "branch"
  | "analytics"
  | "reviews"
  | "verifications"
  | "notifications";

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
};

export async function serviceRequest<TResponse, TBody = unknown>(
  input: ServiceRequest<TBody>
): Promise<TResponse> {
  const token = input.token ?? (await getRawSessionToken());
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
