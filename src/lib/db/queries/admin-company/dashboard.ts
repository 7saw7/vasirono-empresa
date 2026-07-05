import { serviceRequest, serviceRequestOptional } from "@/lib/http/service-client";
import {
  asArray,
  asRecord,
  pick,
  toBoolean,
  toIsoString,
  toNumber,
  toStringValue,
  toTone,
  type AnyRecord,
} from "@/lib/http/service-data";
import { validateDashboardData } from "@/features/admin-company/dashboard/schema";
import type {
  DashboardActivityItem,
  DashboardBranchPerformanceItem,
  DashboardCompanyScore,
  DashboardData,
  DashboardKpi,
  DashboardVerificationSummary,
} from "@/features/admin-company/dashboard/types";

export async function getDashboardQuery(companyId: number) {
  return getCompanyDashboardQuery(companyId);
}

export async function getCompanyDashboardQuery(companyId: number) {
  const [companyPayload, analyticsPayload, verificationPayload] =
    await Promise.all([
      serviceRequestOptional<unknown>({
        service: "companies",
        companyId,
        directPath: "/api/companies/me/profile",
        gatewayPath: "/api/companies/api/companies/me/profile",
      }),
      serviceRequestOptional<unknown>({
        service: "analytics",
        companyId,
        directPath: "/api/company/analytics/dashboard",
        gatewayPath: "/api/analytics/api/company/analytics/dashboard",
      }),
      serviceRequestOptional<unknown>({
        service: "verifications",
        companyId,
        directPath: `/api/business/companies/${companyId}/verifications/overview`,
        gatewayPath: `/api/verifications/api/business/companies/${companyId}/verifications/overview`,
      }),
    ]);

  const company = asRecord(companyPayload);
  const analytics = asRecord(analyticsPayload);
  const verification = asRecord(verificationPayload);

  const data: DashboardData = {
    companyName: toStringValue(
      pick(company, "name", "companyName", "company_name") ??
        pick(analytics, "companyName", "company_name"),
      "Mi negocio"
    ),
    kpis: normalizeKpis(analytics),
    recentActivity: normalizeActivity(analytics),
    companyScore: normalizeCompanyScore(analytics),
    verificationSummary: normalizeVerificationSummary(verification, analytics),
    branchPerformance: normalizeBranchPerformance(analytics),
  };

  return validateDashboardData(data);
}

function normalizeKpis(row: AnyRecord): DashboardKpi[] {
  const fromService = asArray(pick(row, "kpis", "cards"));

  if (fromService.length) {
    return fromService.map((item, index) => ({
      id: toStringValue(pick(item, "id", "key"), `kpi-${index}`),
      label: toStringValue(pick(item, "label", "title"), "Indicador"),
      value: toStringValue(pick(item, "value"), "0"),
      helper: toStringValue(pick(item, "helper", "description"), "") || undefined,
      trend: normalizeTrend(pick(item, "trend")),
    }));
  }

  const summary = asRecord(pick(row, "summary"));
  const profileViews = toNumber(pick(row, "profileViews", "profile_views") ?? pick(summary, "profileViews", "profile_views"));
  const favoritesAdded = toNumber(pick(row, "favoritesAdded", "favorites_added") ?? pick(summary, "favoritesAdded", "favorites_added"));
  const contactClicks = toNumber(pick(row, "contactClicks", "contact_clicks") ?? pick(summary, "contactClicks", "contact_clicks"));
  const reviewsGenerated = toNumber(pick(row, "reviewsGenerated", "reviews_generated") ?? pick(summary, "reviewsGenerated", "reviews_generated"));

  return [
    {
      id: "profile-views",
      label: "Vistas del perfil",
      value: String(profileViews),
      helper: "Interacciones registradas por Analytics.",
    },
    {
      id: "favorites-added",
      label: "Favoritos",
      value: String(favoritesAdded),
      helper: "Usuarios que guardaron el negocio.",
    },
    {
      id: "contact-clicks",
      label: "Clics de contacto",
      value: String(contactClicks),
      helper: "Clics en teléfono, WhatsApp o web.",
    },
    {
      id: "reviews",
      label: "Reseñas",
      value: String(reviewsGenerated),
      helper: "Reseñas generadas en el periodo.",
    },
  ];
}

function normalizeTrend(value: unknown): DashboardKpi["trend"] {
  const row = asRecord(value);
  if (!Object.keys(row).length) return undefined;

  const direction = toStringValue(pick(row, "direction"), "neutral");
  return {
    value: toStringValue(pick(row, "value"), "0%"),
    direction:
      direction === "up" || direction === "down" || direction === "neutral"
        ? direction
        : "neutral",
  };
}

function normalizeActivity(row: AnyRecord): DashboardActivityItem[] {
  return asArray(pick(row, "recentActivity", "recent_activity", "activity")).map(
    (item, index) => ({
      id: toStringValue(pick(item, "id"), `activity-${index}`),
      title: toStringValue(pick(item, "title"), "Actividad"),
      description: toStringValue(pick(item, "description"), ""),
      createdAt: toIsoString(pick(item, "createdAt", "created_at")),
      type: normalizeActivityType(pick(item, "type")),
    })
  );
}

function normalizeActivityType(value: unknown): DashboardActivityItem["type"] {
  const type = toStringValue(value, "system");

  if (
    ["review", "verification", "branch", "analytics", "company", "system"].includes(
      type
    )
  ) {
    return type as DashboardActivityItem["type"];
  }

  return "system";
}

function normalizeCompanyScore(row: AnyRecord): DashboardCompanyScore | null {
  const score = asRecord(pick(row, "companyScore", "company_score", "score"));

  if (!Object.keys(score).length) return null;

  return {
    finalScore: toNumber(pick(score, "finalScore", "final_score")),
    popularityScore: toNumber(pick(score, "popularityScore", "popularity_score")),
    engagementScore: toNumber(pick(score, "engagementScore", "engagement_score")),
    conversionScore: toNumber(pick(score, "conversionScore", "conversion_score")),
    trustScore: toNumber(pick(score, "trustScore", "trust_score")),
    freshnessScore: toNumber(pick(score, "freshnessScore", "freshness_score")),
    calculatedAt: toIsoString(pick(score, "calculatedAt", "calculated_at")),
  };
}

function normalizeVerificationSummary(
  verification: AnyRecord,
  analytics: AnyRecord
): DashboardVerificationSummary | null {
  const summary = asRecord(
    pick(verification, "summary") ??
      pick(analytics, "verificationSummary", "verification_summary") ??
      verification
  );

  if (!Object.keys(summary).length) return null;

  const request = asRecord(pick(summary, "request"));
  const checks = asArray(pick(verification, "checks"));
  const flags = asRecord(pick(verification, "flags"));

  const statusCode = toStringValue(
    pick(summary, "statusCode", "status_code") ?? pick(request, "statusCode", "status_code"),
    ""
  ).toLowerCase();

  const completedChecks = checks.filter((item) => {
    const check = asRecord(item);
    const code = toStringValue(pick(check, "statusCode", "status_code"), "").toLowerCase();
    return Boolean(pick(check, "verifiedAt", "verified_at")) ||
      ["verified", "approved", "completed", "passed", "accepted"].includes(code);
  }).length;

  const completedFlags = Object.values(flags).filter(Boolean).length;
  const checksCompleted = toNumber(
    pick(summary, "checksCompleted", "checks_completed"),
    Math.max(completedChecks, completedFlags)
  );
  const checksTotal = toNumber(
    pick(summary, "checksTotal", "checks_total"),
    Math.max(checks.length, 4)
  );

  return {
    level: toStringValue(
      pick(summary, "level", "verificationLevel", "verification_level"),
      "Pendiente"
    ),
    statusLabel: toStringValue(
      pick(summary, "statusLabel", "status_label", "statusName", "status_name", "requestStatusName", "request_status_name") ??
        pick(request, "statusName", "status_name"),
      "Sin revisión"
    ),
    statusTone: toTone(
      pick(summary, "statusTone", "status_tone") ?? inferVerificationTone(statusCode)
    ),
    score: toNumber(pick(summary, "score", "verificationScore", "verification_score")),
    lastReviewAt:
      pick(summary, "lastReviewAt", "last_review_at", "reviewedAt", "reviewed_at", "verifiedAt", "verified_at") === undefined
        ? null
        : String(pick(summary, "lastReviewAt", "last_review_at", "reviewedAt", "reviewed_at", "verifiedAt", "verified_at")),
    checksCompleted,
    checksTotal,
  };
}

function inferVerificationTone(
  statusCode: string
): DashboardVerificationSummary["statusTone"] {
  if (["approved", "verified", "completed", "accepted"].includes(statusCode)) {
    return "success";
  }

  if (["rejected", "failed", "cancelled", "expired"].includes(statusCode)) {
    return "danger";
  }

  if (["submitted", "in_review", "review", "pending", "started", "draft"].includes(statusCode)) {
    return "warning";
  }

  return "default";
}

function normalizeBranchPerformance(row: AnyRecord): DashboardBranchPerformanceItem[] {
  return asArray(
    pick(row, "branchPerformance", "branch_performance", "branches") ??
      pick(row, "branchRanking", "branch_ranking")
  ).map((item) => ({
    branchId: toNumber(pick(item, "branchId", "branch_id", "id")),
    branchName: toStringValue(
      pick(item, "branchName", "branch_name", "name"),
      "Sucursal"
    ),
    districtName: toStringValue(
      pick(item, "districtName", "district_name"),
      "Sin distrito"
    ),
    finalScore: toNumber(pick(item, "finalScore", "final_score")),
    visits30d: toNumber(pick(item, "visits30d", "visits_30d")),
    reviews90d: toNumber(pick(item, "reviews90d", "reviews_90d")),
    avgRating90d: toNumber(pick(item, "avgRating90d", "avg_rating_90d")),
    isMain: toBoolean(pick(item, "isMain", "is_main"), false),
  }));
}
