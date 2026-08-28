export type PlanCode =
  | "free"
  | "esencial"
  | "pro"
  | "impulso"
  | "premium"
  | "estrategico";

export type BillingCheckoutMode = "mock" | "provider";

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

export type BillingPlanOption = UpgradeTarget & {
  planId: number | null;
  price: number;
  currency: string;
  billingInterval: "month";
  intervalMonths: number;
  providerPriceId: string | null;
  isCurrent: boolean;
  checkoutEnabled: boolean;
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
  availablePlans: BillingPlanOption[];
  checkoutMode: BillingCheckoutMode;
  checkoutEnabled: boolean;
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
  planCode: PlanCode;
  idempotencyKey: string;
  promotionCode?: string;
};

export type UpgradeCheckoutResult = {
  mode: BillingCheckoutMode;
  provider: string;
  status: "approved" | "pending" | "failed" | "unchanged";
  reference?: string | null;
  checkoutUrl?: string | null;
  companyId: number;
  plan: PlanCode;
  planId: number;
  planName: string;
  amount: number;
  currency: string;
  message?: string;
};
