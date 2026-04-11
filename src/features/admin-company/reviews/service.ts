import type {
  ReviewFilters,
  ReviewResponse,
  ReviewsPayload,
  UpsertReviewResponseInput,
} from "./types";

function toQueryString(filters: ReviewFilters, includeMetrics = false) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
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
  if (includeMetrics) {
    params.set("includeMetrics", "true");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getReviews(
  filters: ReviewFilters = {},
  includeMetrics = true
): Promise<ReviewsPayload> {
  const response = await fetch(
    `/api/admin-company/reviews${toQueryString(filters, includeMetrics)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudieron cargar las reseñas.");
  }

  return payload.data as ReviewsPayload;
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
    body: JSON.stringify(input),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo guardar la respuesta."
    );
  }

  return payload.data as ReviewResponse;
}