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

export type ReviewFilters = {
  search?: string;
  rating?: number;
  branchId?: number;
  responded?: boolean;
  validated?: boolean;
};

export type ReviewsPayload = {
  reviews: ReviewItem[];
  metrics: ReviewMetrics | null;
};

export type UpsertReviewResponseInput = {
  responseText: string;
};