import { serviceRequest, serviceRequestOptional } from "@/lib/http/service-client";
import {
  asRecord,
  pick,
  toBoolean,
  toNullableNumber,
  toNumber,
  toStringValue,
  unwrapList,
  type AnyRecord,
} from "@/lib/http/service-data";
import type {
  BillingOverview,
  CurrentPlan,
  PaymentHistoryItem,
  PlanCode,
  PlanFeatures,
  PlanLimits,
  SubscriptionHistoryItem,
  UpgradeCheckoutInput,
  UpgradeTarget,
} from "@/features/admin-company/billing/types";

const DEFAULT_LIMITS: Record<PlanCode, PlanLimits> = {
  free: { branches: 1, promotions: 0, media: 3, teamMembers: 1 },
  pro: { branches: 5, promotions: 10, media: 30, teamMembers: 3 },
  premium: { branches: 20, promotions: 25, media: 100, teamMembers: 10 },
};

const DEFAULT_FEATURES: Record<PlanCode, PlanFeatures> = {
  free: {
    analyticsAdvanced: false,
    promotions: false,
    priorityVerification: false,
    teamManagement: false,
    billingHistory: true,
    reviewResponses: true,
    verificationCenter: true,
  },
  pro: {
    analyticsAdvanced: true,
    promotions: true,
    priorityVerification: false,
    teamManagement: true,
    billingHistory: true,
    reviewResponses: true,
    verificationCenter: true,
  },
  premium: {
    analyticsAdvanced: true,
    promotions: true,
    priorityVerification: true,
    teamManagement: true,
    billingHistory: true,
    reviewResponses: true,
    verificationCenter: true,
  },
};

export async function getCompanyBillingQuery(
  companyId: number
): Promise<BillingOverview> {
  const [currentPlan, payments, subscriptions] = await Promise.all([
    getCurrentPlanQuery(companyId),
    listPaymentsQuery(companyId),
    listSubscriptionsQuery(companyId),
  ]);

  return {
    currentPlan,
    payments,
    subscriptions,
  };
}

export async function getCurrentPlanQuery(companyId: number): Promise<CurrentPlan> {
  const payload = await serviceRequest<unknown>({
    service: "billing",
    companyId,
    directPath: "/api/company/billing/current-plan",
    gatewayPath: "/api/billing/api/company/billing/current-plan",
    errorCode: "BILLING_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el plan actual.",
  });

  return normalizeCurrentPlan(payload, companyId);
}

export async function listPaymentsQuery(
  companyId: number
): Promise<PaymentHistoryItem[]> {
  const payload = await serviceRequestOptional<unknown>({
    service: "billing",
    companyId,
    directPath: "/api/company/billing/payments",
    gatewayPath: "/api/billing/api/company/billing/payments",
    query: { page: 1, pageSize: 10 },
  });

  return unwrapList(payload, "items", "data", "payments").map(normalizePayment);
}

export async function listSubscriptionsQuery(
  companyId: number
): Promise<SubscriptionHistoryItem[]> {
  const payload = await serviceRequestOptional<unknown>({
    service: "billing",
    companyId,
    directPath: "/api/company/billing/subscriptions",
    gatewayPath: "/api/billing/api/company/billing/subscriptions",
    query: { page: 1, pageSize: 10 },
  });

  return unwrapList(payload, "items", "data", "subscriptions").map(normalizeSubscription);
}

export async function createUpgradeCheckoutQuery(
  companyId: number,
  input: UpgradeCheckoutInput
): Promise<unknown> {
  return serviceRequest<unknown, UpgradeCheckoutInput>({
    service: "billing",
    companyId,
    directPath: "/api/company/billing/checkout",
    gatewayPath: "/api/billing/api/company/billing/checkout",
    method: "POST",
    body: input,
    errorCode: "BILLING_CHECKOUT_ERROR",
    errorMessage: "No se pudo iniciar el cambio de plan.",
  });
}

function normalizeCurrentPlan(value: unknown, companyId: number): CurrentPlan {
  const row = asRecord(value);
  const plan = normalizePlanCode(pick(row, "plan"), pick(row, "planName", "plan_name"));
  const limits = normalizeLimits(pick(row, "limits"), plan);
  const features = normalizeFeatures(pick(row, "features"), plan);
  const upgradeTargets = unwrapList(row, "upgradeTargets", "upgrade_targets").map(normalizeUpgradeTarget);

  return {
    companyId: toNumber(pick(row, "companyId", "company_id"), companyId),
    planId: toNullableNumber(pick(row, "planId", "plan_id")),
    planName: toStringValue(pick(row, "planName", "plan_name"), plan).trim() || plan,
    plan,
    status: toStringValue(pick(row, "status"), "active"),
    statusLabel: toStringValue(pick(row, "statusLabel", "status_label", "subscriptionStatus", "subscription_status"), "active"),
    subscriptionStatus:
      pick(row, "subscriptionStatus", "subscription_status") === undefined
        ? null
        : String(pick(row, "subscriptionStatus", "subscription_status")),
    isActive: toBoolean(pick(row, "isActive", "is_active"), true),
    limits,
    features,
    benefits: normalizeStringList(pick(row, "benefits")),
    upgradeTargets: upgradeTargets.length ? upgradeTargets : defaultUpgradeTargets(plan),
    canCreatePromotion: toBoolean(pick(row, "canCreatePromotion", "can_create_promotion"), features.promotions),
    promotionLimit: toNullableNumber(pick(row, "promotionLimit", "promotion_limit")) ?? limits.promotions,
  };
}

function normalizeUpgradeTarget(row: AnyRecord): UpgradeTarget {
  const plan = normalizePlanCode(pick(row, "plan"), pick(row, "label", "planName", "plan_name"));
  return {
    plan,
    label: toStringValue(pick(row, "label", "planName", "plan_name"), plan),
    recommended: toBoolean(pick(row, "recommended"), plan === "pro"),
    limits: normalizeLimits(pick(row, "limits"), plan),
    features: normalizeFeatures(pick(row, "features"), plan),
    benefits: normalizeStringList(pick(row, "benefits")),
  };
}

function normalizePayment(row: AnyRecord): PaymentHistoryItem {
  return {
    id: toNumber(pick(row, "id", "paymentId", "payment_id")),
    amount: toNumber(pick(row, "amount")),
    paymentMethodName: toStringValue(pick(row, "paymentMethodName", "payment_method_name"), "—"),
    statusName: pick(row, "statusName", "status_name") === undefined ? null : String(pick(row, "statusName", "status_name")),
    statusKind: toStringValue(pick(row, "statusKind", "status_kind"), "unknown"),
    createdAt: toStringValue(pick(row, "createdAt", "created_at"), ""),
  };
}

function normalizeSubscription(row: AnyRecord): SubscriptionHistoryItem {
  return {
    id: toNumber(pick(row, "id", "subscriptionId", "subscription_id")),
    planName: toStringValue(pick(row, "planName", "plan_name"), "—"),
    statusName: pick(row, "statusName", "status_name") === undefined ? null : String(pick(row, "statusName", "status_name")),
    statusKind: toStringValue(pick(row, "statusKind", "status_kind"), "unknown"),
    startDate: pick(row, "startDate", "start_date") === undefined ? null : String(pick(row, "startDate", "start_date")),
    endDate: pick(row, "endDate", "end_date") === undefined ? null : String(pick(row, "endDate", "end_date")),
    isActive: toBoolean(pick(row, "isActive", "is_active"), false),
  };
}

function normalizePlanCode(code: unknown, name: unknown): PlanCode {
  const raw = `${toStringValue(code)} ${toStringValue(name)}`.toLowerCase();
  if (raw.includes("premium") || raw.includes("enterprise")) return "premium";
  if (raw.includes("pro")) return "pro";
  return "free";
}

function normalizeLimits(value: unknown, plan: PlanCode): PlanLimits {
  const row = asRecord(value);
  const fallback = DEFAULT_LIMITS[plan];
  return {
    branches: toNullableNumber(pick(row, "branches")) ?? fallback.branches,
    promotions: toNullableNumber(pick(row, "promotions")) ?? fallback.promotions,
    media: toNullableNumber(pick(row, "media")) ?? fallback.media,
    teamMembers: toNullableNumber(pick(row, "teamMembers", "team_members")) ?? fallback.teamMembers,
  };
}

function normalizeFeatures(value: unknown, plan: PlanCode): PlanFeatures {
  const row = asRecord(value);
  const fallback = DEFAULT_FEATURES[plan];
  return {
    analyticsAdvanced: toBoolean(pick(row, "analyticsAdvanced", "analytics_advanced"), fallback.analyticsAdvanced),
    promotions: toBoolean(pick(row, "promotions"), fallback.promotions),
    priorityVerification: toBoolean(pick(row, "priorityVerification", "priority_verification"), fallback.priorityVerification),
    teamManagement: toBoolean(pick(row, "teamManagement", "team_management"), fallback.teamManagement),
    billingHistory: toBoolean(pick(row, "billingHistory", "billing_history"), fallback.billingHistory),
    reviewResponses: toBoolean(pick(row, "reviewResponses", "review_responses"), fallback.reviewResponses),
    verificationCenter: toBoolean(pick(row, "verificationCenter", "verification_center"), fallback.verificationCenter),
  };
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function defaultUpgradeTargets(plan: PlanCode): UpgradeTarget[] {
  const order: PlanCode[] = ["free", "pro", "premium"];
  const currentIndex = order.indexOf(plan);
  return order.slice(currentIndex + 1).map((target) => ({
    plan: target,
    label: target === "pro" ? "Pro" : "Premium",
    recommended: target === "pro",
    limits: DEFAULT_LIMITS[target],
    features: DEFAULT_FEATURES[target],
    benefits: [],
  }));
}
