import { serviceRequest } from "@/lib/http/service-client";
import {
  asRecord,
  pick,
  toBoolean,
  toIsoString,
  toNullableNumber,
  toNumber,
  toStringValue,
  unwrapList,
  type AnyRecord,
} from "@/lib/http/service-data";
import type {
  ReviewFilters,
  ReviewItem,
  ReviewMedia,
  ReviewMetrics,
  ReviewPaginationMeta,
  ReviewResponse,
  ReviewsPayload,
  UpsertReviewResponseInput,
} from "@/features/admin-company/reviews/types";

export async function listReviewsQuery(
  companyId: number,
  filters: ReviewFilters = {}
): Promise<ReviewItem[]> {
  const payload = await getReviewsPayloadQuery(companyId, filters);
  return payload.reviews;
}

export async function getReviewsPayloadQuery(
  companyId: number,
  filters: ReviewFilters = {}
): Promise<ReviewsPayload> {
  const payload = await serviceRequest<unknown>({
    service: "reviews",
    companyId,
    directPath: `/api/business/companies/${companyId}/reviews`,
    gatewayPath: `/api/reviews/api/business/companies/${companyId}/reviews`,
    query: {
      search: filters.search?.trim() || undefined,
      rating: filters.rating,
      branchId: filters.branchId,
      responded: filters.responded,
      validated: filters.validated,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
    },
    errorCode: "REVIEWS_SERVICE_ERROR",
    errorMessage: "No se pudieron cargar las reseñas.",
  });

  const root = asRecord(payload);
  const reviews = unwrapList(payload, "items", "reviews", "data").map(normalizeReview);

  return {
    reviews,
    metrics: null,
    meta: normalizeMeta(asRecord(pick(root, "meta", "pagination")), reviews.length, filters),
  };
}

export async function getReviewMetricsQuery(
  companyId: number,
  filters: ReviewFilters = {}
): Promise<ReviewMetrics | null> {
  const payload = await serviceRequest<unknown>({
    service: "reviews",
    companyId,
    directPath: `/api/business/companies/${companyId}/reviews/metrics`,
    gatewayPath: `/api/reviews/api/business/companies/${companyId}/reviews/metrics`,
    query: {
      search: filters.search?.trim() || undefined,
      rating: filters.rating,
      branchId: filters.branchId,
      responded: filters.responded,
      validated: filters.validated,
    },
    errorCode: "REVIEW_METRICS_SERVICE_ERROR",
    errorMessage: "No se pudieron cargar las métricas de reseñas.",
  });

  return normalizeMetrics(asRecord(payload));
}

export async function upsertReviewResponseQuery(
  companyId: number,
  reviewId: number,
  input: UpsertReviewResponseInput
): Promise<ReviewResponse> {
  const payload = await serviceRequest<unknown, UpsertReviewResponseInput>({
    service: "reviews",
    companyId,
    directPath: `/api/business/companies/${companyId}/reviews/${reviewId}/response`,
    gatewayPath: `/api/reviews/api/business/companies/${companyId}/reviews/${reviewId}/response`,
    method: "PUT",
    body: input,
    errorCode: "REVIEWS_SERVICE_ERROR",
    errorMessage: "No se pudo responder la reseña.",
  });

  return normalizeReviewResponse(asRecord(payload), reviewId);
}

function normalizeMeta(
  row: AnyRecord,
  itemCount: number,
  filters: ReviewFilters
): ReviewPaginationMeta {
  const page = Math.max(1, toNumber(pick(row, "page"), filters.page ?? 1));
  const pageSize = Math.max(1, toNumber(pick(row, "pageSize", "page_size"), filters.pageSize ?? 10));
  const total = Math.max(0, toNumber(pick(row, "total", "totalItems", "total_items"), itemCount));
  const totalPages = Math.max(1, toNumber(pick(row, "totalPages", "total_pages"), Math.ceil(total / pageSize) || 1));

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: toBoolean(pick(row, "hasNextPage", "has_next_page"), page < totalPages),
    hasPreviousPage: toBoolean(
      pick(row, "hasPreviousPage", "has_previous_page"),
      page > 1
    ),
  };
}

function normalizeMetrics(row: AnyRecord): ReviewMetrics | null {
  if (!Object.keys(row).length) return null;

  return {
    totalReviews: toNumber(pick(row, "totalReviews", "total_reviews", "total")),
    averageRating: toNumber(pick(row, "averageRating", "average_rating", "avgRating", "avg_rating")),
    responseRate: toNumber(pick(row, "responseRate", "response_rate")),
    validatedRate: toNumber(pick(row, "validatedRate", "validated_rate")),
  };
}

function normalizeReview(row: AnyRecord): ReviewItem {
  const reviewId = toNumber(pick(row, "id", "reviewId", "review_id"));
  const media = normalizeMediaList(pick(row, "media", "reviewMedia", "review_media"));

  return {
    id: reviewId,
    branchId: toNumber(pick(row, "branchId", "branch_id")),
    branchName: toStringValue(
      pick(row, "branchName", "branch_name", "branch"),
      "Sucursal"
    ),
    userName: toStringValue(
      pick(row, "userName", "user_name", "authorName", "author_name"),
      "Usuario"
    ),
    rating: toNumber(pick(row, "rating", "stars")),
    comment: toStringValue(pick(row, "comment", "text", "content"), ""),
    validated: toBoolean(pick(row, "validated", "isValidated", "is_validated"), false),
    createdAt: toIsoString(pick(row, "createdAt", "created_at")),
    usefulnessScore: toNullableNumber(
      pick(row, "usefulnessScore", "usefulness_score")
    ),
    likesCount: toNumber(pick(row, "likesCount", "likes_count", "likes")),
    dislikesCount: toNumber(
      pick(row, "dislikesCount", "dislikes_count", "dislikes")
    ),
    mediaCount: Math.max(
      media.length,
      toNumber(pick(row, "mediaCount", "media_count"))
    ),
    media,
    response: normalizeReviewResponseNullable(row, reviewId),
  };
}

function normalizeMediaList(value: unknown): ReviewMedia[] {
  let candidate = value;

  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      candidate = [];
    }
  }

  if (!Array.isArray(candidate)) return [];

  return candidate
    .map((item) => asRecord(item))
    .map((item) => ({
      id: toNumber(pick(item, "id", "mediaId", "media_id")),
      mediaType: toStringValue(
        pick(item, "mediaType", "media_type", "mediaTypeName", "media_type_name"),
        "image"
      ),
      url: toStringValue(pick(item, "url"), ""),
      altText: toStringValue(pick(item, "altText", "alt_text"), "") || null,
      isCover: toBoolean(pick(item, "isCover", "is_cover"), false),
      sortOrder: toNumber(pick(item, "sortOrder", "sort_order"), 1),
    }))
    .filter((item) => item.id > 0 && item.url.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

function normalizeReviewResponseNullable(
  reviewRow: AnyRecord,
  fallbackReviewId: number
): ReviewResponse | null {
  const nested = asRecord(
    pick(reviewRow, "response", "businessResponse", "business_response")
  );

  if (Object.keys(nested).length) {
    return normalizeReviewResponse(nested, fallbackReviewId);
  }

  const responseId = toNumber(
    pick(reviewRow, "responseId", "response_id")
  );
  const responseText = toStringValue(
    pick(reviewRow, "responseText", "response_text"),
    ""
  );

  if (responseId <= 0 && responseText.length === 0) return null;

  return normalizeReviewResponse(reviewRow, fallbackReviewId);
}

function normalizeReviewResponse(
  row: AnyRecord,
  fallbackReviewId: number
): ReviewResponse {
  return {
    id: toNumber(pick(row, "responseId", "response_id", "id")),
    reviewId: toNumber(pick(row, "reviewId", "review_id"), fallbackReviewId),
    companyId: toNumber(pick(row, "companyId", "company_id")),
    responderName: toStringValue(
      pick(row, "responderName", "responder_name", "authorName", "author_name"),
      "Equipo Vasirono"
    ),
    responseText: toStringValue(
      pick(row, "responseText", "response_text", "text", "content"),
      ""
    ),
    statusLabel: toStringValue(
      pick(
        row,
        "statusLabel",
        "status_label",
        "statusName",
        "status_name",
        "responseStatusName",
        "response_status_name",
        "status",
        "responseStatus",
        "response_status"
      ),
      "Publicada"
    ),
    respondedAt: toIsoString(
      pick(row, "respondedAt", "responded_at", "createdAt", "created_at")
    ),
  };
}
