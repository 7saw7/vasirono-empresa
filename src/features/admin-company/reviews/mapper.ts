import type {
  ReviewItem,
  ReviewMedia,
  ReviewMetrics,
  ReviewPaginationMeta,
  ReviewResponse,
  ReviewsPayload,
} from "./types";

type RawReviewResponse = {
  id: number;
  review_id: number;
  company_id: number;
  responder_name: string;
  response_text: string;
  status_label: string;
  responded_at: string;
};

type RawReviewMedia = {
  id: number;
  media_type?: string | null;
  media_type_name?: string | null;
  url: string;
  alt_text?: string | null;
  is_cover?: boolean | null;
  sort_order?: number | null;
};

type RawReviewItem = {
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
  media?: RawReviewMedia[] | null;
  response: RawReviewResponse | null;
};

type RawReviewMetrics = {
  total_reviews: number;
  average_rating: number;
  response_rate: number;
  validated_rate: number;
};

type RawReviewPaginationMeta = {
  total?: number | null;
  page?: number | null;
  page_size?: number | null;
  total_pages?: number | null;
  has_next_page?: boolean | null;
  has_previous_page?: boolean | null;
};

export function mapReviewResponse(raw: RawReviewResponse): ReviewResponse {
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

export function mapReviewMedia(raw: RawReviewMedia): ReviewMedia {
  return {
    id: raw.id,
    mediaType: raw.media_type_name ?? raw.media_type ?? "image",
    url: raw.url,
    altText: raw.alt_text ?? null,
    isCover: raw.is_cover ?? false,
    sortOrder: raw.sort_order ?? 1,
  };
}

export function mapReviewItem(raw: RawReviewItem): ReviewItem {
  const media = (raw.media ?? [])
    .map(mapReviewMedia)
    .filter((item) => item.id > 0 && item.url.trim().length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

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
    mediaCount: Math.max(raw.media_count ?? 0, media.length),
    media,
    response: raw.response ? mapReviewResponse(raw.response) : null,
  };
}

export function mapReviewMetrics(raw: RawReviewMetrics): ReviewMetrics {
  return {
    totalReviews: raw.total_reviews,
    averageRating: Number(raw.average_rating ?? 0),
    responseRate: Number(raw.response_rate ?? 0),
    validatedRate: Number(raw.validated_rate ?? 0),
  };
}

export function mapReviewPaginationMeta(
  raw: RawReviewPaginationMeta | null | undefined,
  itemCount: number
): ReviewPaginationMeta {
  const page = Math.max(1, Number(raw?.page ?? 1));
  const fallbackPageSize = itemCount > 0 ? itemCount : 10;
  const pageSize = Math.max(1, Number(raw?.page_size ?? fallbackPageSize));
  const total = Math.max(0, Number(raw?.total ?? itemCount));
  const totalPages = Math.max(
    1,
    Number(raw?.total_pages ?? (Math.ceil(total / pageSize) || 1))
  );

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: raw?.has_next_page ?? page < totalPages,
    hasPreviousPage: raw?.has_previous_page ?? page > 1,
  };
}

export function mapReviewsPayload(raw: {
  reviews: RawReviewItem[];
  metrics: RawReviewMetrics | null;
  meta?: RawReviewPaginationMeta | null;
}): ReviewsPayload {
  const reviews = raw.reviews.map(mapReviewItem);

  return {
    reviews,
    metrics: raw.metrics ? mapReviewMetrics(raw.metrics) : null,
    meta: mapReviewPaginationMeta(raw.meta, reviews.length),
  };
}
