import type {
  DashboardActivityItem,
  DashboardBranchPerformanceItem,
  DashboardCompanyScore,
  DashboardData,
  DashboardKpi,
  DashboardVerificationSummary,
} from "./types";
import { formatCompactNumber } from "@/lib/utils/numbers";

type RawDashboardKpi = {
  id: string;
  label: string;
  value: number | string;
  helper?: string;
  trend_value?: string;
  trend_direction?: "up" | "down" | "neutral";
};

type RawDashboardActivityItem = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type: DashboardActivityItem["type"];
};

type RawDashboardCompanyScore = {
  final_score: number;
  popularity_score: number;
  engagement_score: number;
  conversion_score: number;
  trust_score: number;
  freshness_score: number;
  calculated_at: string;
};

type RawDashboardVerificationSummary = {
  level: string;
  status_label: string;
  status_tone: DashboardVerificationSummary["statusTone"];
  score: number;
  last_review_at?: string | null;
  checks_completed: number;
  checks_total: number;
};

type RawDashboardBranchPerformanceItem = {
  branch_id: number;
  branch_name: string;
  district_name: string;
  final_score: number;
  visits_30d: number;
  reviews_90d: number;
  avg_rating_90d: number;
  is_main: boolean;
};

export function mapDashboardKpi(raw: RawDashboardKpi): DashboardKpi {
  return {
    id: raw.id,
    label: raw.label,
    value:
      typeof raw.value === "number" ? formatCompactNumber(raw.value) : raw.value,
    helper: raw.helper,
    trend: raw.trend_value
      ? {
          value: raw.trend_value,
          direction: raw.trend_direction ?? "neutral",
        }
      : undefined,
  };
}

export function mapDashboardActivityItem(
  raw: RawDashboardActivityItem
): DashboardActivityItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    createdAt: raw.created_at,
    type: raw.type,
  };
}

export function mapDashboardCompanyScore(
  raw: RawDashboardCompanyScore
): DashboardCompanyScore {
  return {
    finalScore: raw.final_score,
    popularityScore: raw.popularity_score,
    engagementScore: raw.engagement_score,
    conversionScore: raw.conversion_score,
    trustScore: raw.trust_score,
    freshnessScore: raw.freshness_score,
    calculatedAt: raw.calculated_at,
  };
}

export function mapDashboardVerificationSummary(
  raw: RawDashboardVerificationSummary
): DashboardVerificationSummary {
  return {
    level: raw.level,
    statusLabel: raw.status_label,
    statusTone: raw.status_tone,
    score: raw.score,
    lastReviewAt: raw.last_review_at ?? null,
    checksCompleted: raw.checks_completed,
    checksTotal: raw.checks_total,
  };
}

export function mapDashboardBranchPerformanceItem(
  raw: RawDashboardBranchPerformanceItem
): DashboardBranchPerformanceItem {
  return {
    branchId: raw.branch_id,
    branchName: raw.branch_name,
    districtName: raw.district_name,
    finalScore: raw.final_score,
    visits30d: raw.visits_30d,
    reviews90d: raw.reviews_90d,
    avgRating90d: raw.avg_rating_90d,
    isMain: raw.is_main,
  };
}

export function mapDashboardData(raw: {
  company_name: string;
  kpis: RawDashboardKpi[];
  recent_activity: RawDashboardActivityItem[];
  company_score: RawDashboardCompanyScore | null;
  verification_summary: RawDashboardVerificationSummary | null;
  branch_performance: RawDashboardBranchPerformanceItem[];
}): DashboardData {
  return {
    companyName: raw.company_name,
    kpis: raw.kpis.map(mapDashboardKpi),
    recentActivity: raw.recent_activity.map(mapDashboardActivityItem),
    companyScore: raw.company_score
      ? mapDashboardCompanyScore(raw.company_score)
      : null,
    verificationSummary: raw.verification_summary
      ? mapDashboardVerificationSummary(raw.verification_summary)
      : null,
    branchPerformance: raw.branch_performance.map(
      mapDashboardBranchPerformanceItem
    ),
  };
}