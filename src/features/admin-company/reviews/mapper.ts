import type {
  ReviewItem,
  ReviewMetrics,
  ReviewResponse,
  ReviewsPayload,
} from "./types";

export function mapReviewResponse(raw: {
  id: number;
  review_id: number;
  company_id: number;
  responder_name: string;
  response_text: string;
  status_label: string;
  responded_at: string;
}): ReviewResponse {
  return {
    id: raw.id,
    reviewId: raw.review_id,
    companyId: raw.company_id,
    responderName: raw.responder_name,
    responseText: raw.response_text,
    statusLabel: raw.status_label,
    respondedAt: raw.responded_at,
  };
}

export function mapReviewItem(raw: {
  id: number;
  branch_id: number;
  branch_name: string;
  user_name: string;
  rating: number;
  comment: string | null;
  validated: boolean;
  created_at: string;
  usefulness_score: number | null;
  likes_count: number | null;
  dislikes_count: number | null;
  media_count: number | null;
  response: {
    id: number;
    review_id: number;
    company_id: number;
    responder_name: string;
    response_text: string;
    status_label: string;
    responded_at: string;
  } | null;
}): ReviewItem {
  return {
    id: raw.id,
    branchId: raw.branch_id,
    branchName: raw.branch_name,
    userName: raw.user_name,
    rating: raw.rating,
    comment: raw.comment ?? "",
    validated: raw.validated,
    createdAt: raw.created_at,
    usefulnessScore: raw.usefulness_score,
    likesCount: raw.likes_count ?? 0,
    dislikesCount: raw.dislikes_count ?? 0,
    mediaCount: raw.media_count ?? 0,
    response: raw.response ? mapReviewResponse(raw.response) : null,
  };
}

export function mapReviewMetrics(raw: {
  total_reviews: number;
  average_rating: number;
  response_rate: number;
  validated_rate: number;
}): ReviewMetrics {
  return {
    totalReviews: raw.total_reviews,
    averageRating: Number(raw.average_rating ?? 0),
    responseRate: Number(raw.response_rate ?? 0),
    validatedRate: Number(raw.validated_rate ?? 0),
  };
}

export function mapReviewsPayload(raw: {
  reviews: Array<Parameters<typeof mapReviewItem>[0]>;
  metrics: Parameters<typeof mapReviewMetrics>[0] | null;
}): ReviewsPayload {
  return {
    reviews: raw.reviews.map(mapReviewItem),
    metrics: raw.metrics ? mapReviewMetrics(raw.metrics) : null,
  };
}