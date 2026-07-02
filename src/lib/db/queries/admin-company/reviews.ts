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
  ReviewMetrics,
  ReviewResponse,
  ReviewsPayload,
  UpsertReviewResponseInput,
} from "@/features/admin-company/reviews/types";

export async function listReviewsQuery(
  companyId: number,
  filters: ReviewFilters = {}
): Promise<ReviewItem[]> {
  const payload = await fetchReviewsPayload(companyId, filters);
  return payload.reviews;
}

export async function getReviewMetricsQuery(
  companyId: number,
  filters: ReviewFilters = {}
): Promise<ReviewMetrics | null> {
  const payload = await fetchReviewsPayload(companyId, filters);
  return payload.metrics;
}

async function fetchReviewsPayload(
  companyId: number,
  filters: ReviewFilters = {}
): Promise<ReviewsPayload> {
  const payload = await serviceRequest<unknown>({
    service: "reviews",
    directPath: `/api/business/companies/${companyId}/reviews`,
    gatewayPath: `/api/reviews/api/business/companies/${companyId}/reviews`,
    query: {
      search: filters.search?.trim() || undefined,
      rating: filters.rating,
      branchId: filters.branchId,
      responded: filters.responded,
      validated: filters.validated,
    },
    errorCode: "REVIEWS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar las reseñas.",
  });

  const row = asRecord(payload);

  return {
    reviews: unwrapList(payload, "items", "reviews", "data").map(normalizeReview),
    metrics: normalizeMetrics(asRecord(pick(row, "metrics", "summary"))),
  };
}

export async function upsertReviewResponseQuery(
  companyId: number,
  reviewId: number,
  input: UpsertReviewResponseInput
): Promise<ReviewResponse> {
  const payload = await serviceRequest<unknown, UpsertReviewResponseInput>({
    service: "reviews",
    directPath: `/api/business/companies/${companyId}/reviews/${reviewId}/response`,
    gatewayPath: `/api/reviews/api/business/companies/${companyId}/reviews/${reviewId}/response`,
    method: "PUT",
    body: input,
    errorCode: "REVIEWS_SERVICE_ERROR",
    errorMessage: "No se pudo responder la reseña.",
  });

  return normalizeReviewResponse(asRecord(payload), reviewId);
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
    mediaCount: toNumber(pick(row, "mediaCount", "media_count")),
    response: normalizeReviewResponseNullable(pick(row, "response", "businessResponse", "business_response"), reviewId),
  };
}

function normalizeReviewResponseNullable(
  value: unknown,
  fallbackReviewId: number
): ReviewResponse | null {
  const row = asRecord(value);

  if (!Object.keys(row).length) return null;

  return normalizeReviewResponse(row, fallbackReviewId);
}

function normalizeReviewResponse(
  row: AnyRecord,
  fallbackReviewId: number
): ReviewResponse {
  return {
    id: toNumber(pick(row, "id", "responseId", "response_id")),
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
      pick(row, "statusLabel", "status_label", "status"),
      "Publicada"
    ),
    respondedAt: toIsoString(pick(row, "respondedAt", "responded_at", "createdAt", "created_at")),
  };
}
