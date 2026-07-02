export type PlanCode = "free" | "pro" | "premium";

export type PlanLimits = {
  branches: number | null;
  promotions: number | null;
  media: number | null;
  teamMembers: number | null;
};

export type PlanFeatures = {
  analyticsAdvanced: boolean;
  promotions: boolean;
  priorityVerification: boolean;
  teamManagement: boolean;
  billingHistory: boolean;
  reviewResponses: boolean;
  verificationCenter: boolean;
};

export type UpgradeTarget = {
  plan: PlanCode;
  label: string;
  recommended: boolean;
  limits: PlanLimits;
  features: PlanFeatures;
  benefits: string[];
};

export type CurrentPlan = {
  companyId: number;
  planId: number | null;
  planName: string | null;
  plan: PlanCode;
  status: string;
  statusLabel: string;
  subscriptionStatus: string | null;
  isActive: boolean;
  limits: PlanLimits;
  features: PlanFeatures;
  benefits: string[];
  upgradeTargets: UpgradeTarget[];
  canCreatePromotion: boolean;
  promotionLimit: number | null;
};

export type PaymentHistoryItem = {
  id: number;
  amount: number;
  paymentMethodName: string;
  statusName: string | null;
  statusKind: string;
  createdAt: string;
};

export type SubscriptionHistoryItem = {
  id: number;
  planName: string;
  statusName: string | null;
  statusKind: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
};

export type BillingOverview = {
  currentPlan: CurrentPlan;
  payments: PaymentHistoryItem[];
  subscriptions: SubscriptionHistoryItem[];
};

export type UpgradeCheckoutInput = {
  planId: number;
  paymentMethodId: number;
  amount: number;
  startDate?: string;
  endDate?: string;
  idempotencyKey?: string;
};
