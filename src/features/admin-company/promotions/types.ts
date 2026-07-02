export type PromotionStatusCode =
  | "draft"
  | "pending_review"
  | "approved"
  | "paused"
  | "rejected"
  | "expired"
  | "deleted"
  | string;

export type PromotionListItem = {
  promotionId: number;
  title: string;
  description: string | null;
  terms: string | null;
  discountPercent: number | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  status: PromotionStatusCode;
  statusName: string | null;
  isPubliclyAvailable: boolean;
  requiresStaffValidation: boolean;
  coverUrl: string | null;
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  redemptionsTotal: number;
  issuedCount: number;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number;
};

export type PromotionListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  branchId?: number;
  status?: PromotionStatusCode;
  active?: boolean;
};

export type PromotionPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PromotionListResult = {
  items: PromotionListItem[];
  pagination: PromotionPagination;
};

export type PromotionFormInput = {
  branchId: number;
  title: string;
  description?: string | null;
  terms?: string | null;
  discountPercent?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
  coverUrl?: string | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number;
  requiresStaffValidation?: boolean;
};

export type PromotionGate = {
  planAllowsPromotions: boolean;
  verifiedForPromotions: boolean;
  canCreatePromotions: boolean;
  reasons: string[];
  planLabel: string;
  promotionLimit: number | null;
  currentActivePromotions: number;
  verificationLabel: string;
};


export type PromotionRedemptionItem = {
  redemptionId: number;
  promotionId: number;
  userName: string | null;
  userEmail: string | null;
  redemptionCode: string;
  status: string;
  statusName: string | null;
  issuedAt: string | null;
  redeemedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
};
