import type {
  ReviewFilters,
  ReviewResponse,
  ReviewsPayload,
  UpsertReviewResponseInput,
} from "./types";

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const row = payload as {
    error?: { message?: unknown; details?: unknown };
  };

  const details = row.error?.details;
  if (details && typeof details === "object") {
    const fieldErrors = details as Record<string, unknown>;
    for (const value of Object.values(fieldErrors)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
      }
    }
  }

  return typeof row.error?.message === "string" ? row.error.message : fallback;
}


async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toQueryString(filters: ReviewFilters, includeMetrics = false) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (typeof filters.rating === "number") {
    params.set("rating", String(filters.rating));
  }
  if (typeof filters.branchId === "number") {
    params.set("branchId", String(filters.branchId));
  }
  if (typeof filters.responded === "boolean") {
    params.set("responded", String(filters.responded));
  }
  if (typeof filters.validated === "boolean") {
    params.set("validated", String(filters.validated));
  }
  if (typeof filters.page === "number") {
    params.set("page", String(filters.page));
  }
  if (typeof filters.pageSize === "number") {
    params.set("pageSize", String(filters.pageSize));
  }
  if (includeMetrics) {
    params.set("includeMetrics", "true");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getReviews(
  filters: ReviewFilters = {},
  includeMetrics = true,
  signal?: AbortSignal
): Promise<ReviewsPayload> {
  const response = await fetch(
    `/api/admin-company/reviews${toQueryString(filters, includeMetrics)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  const payload = await readJsonResponse(response);
  const envelope = payload as { success?: boolean } | null;

  if (!response.ok || !envelope?.success) {
    throw new Error(getApiErrorMessage(payload, "No se pudieron cargar las reseñas."));
  }

  return (payload as { data: ReviewsPayload }).data;
}

export async function upsertReviewResponse(
  reviewId: number,
  input: UpsertReviewResponseInput
): Promise<ReviewResponse> {
  const response = await fetch(`/api/admin-company/reviews/${reviewId}/response`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      responseText: input.responseText.trim(),
    }),
  });

  const payload = await readJsonResponse(response);
  const envelope = payload as { success?: boolean } | null;

  if (!response.ok || !envelope?.success) {
    throw new Error(getApiErrorMessage(payload, "No se pudo guardar la respuesta."));
  }

  return (payload as { data: ReviewResponse }).data;
}
