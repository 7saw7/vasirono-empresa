export type ReviewMedia = {
  id: number;
  mediaType: string;
  url: string;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
};

export type ReviewItem = {
  id: number;
  branchId: number;
  branchName: string;
  userName: string;
  rating: number;
  comment: string;
  validated: boolean;
  createdAt: string;
  usefulnessScore: number | null;
  likesCount: number;
  dislikesCount: number;
  mediaCount: number;
  media: ReviewMedia[];
  response: ReviewResponse | null;
};

export type ReviewResponse = {
  id: number;
  reviewId: number;
  companyId: number;
  responderName: string;
  responseText: string;
  statusLabel: string;
  respondedAt: string;
};

export type ReviewMetrics = {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  validatedRate: number;
};

export type ReviewPaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ReviewFilters = {
  search?: string;
  rating?: number;
  branchId?: number;
  responded?: boolean;
  validated?: boolean;
  page?: number;
  pageSize?: number;
};

export type ReviewsPayload = {
  reviews: ReviewItem[];
  metrics: ReviewMetrics | null;
  meta: ReviewPaginationMeta;
};

export type UpsertReviewResponseInput = {
  responseText: string;
};
