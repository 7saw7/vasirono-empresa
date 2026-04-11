import type { DashboardData } from "./types";
import type { RawDashboardPayload } from "./raw-types";

export function mapDashboardData(raw: RawDashboardPayload): DashboardData {
  return {
    companyName: raw.company_name,
    kpis: raw.kpis.map((item) => ({
      id: item.id,
      label: item.label,
      value: String(item.value),
      helper: item.helper ?? undefined,
      trend:
        item.trend_value && item.trend_direction
          ? {
              value: item.trend_value,
              direction: item.trend_direction,
            }
          : undefined,
    })),
    recentActivity: raw.recent_activity.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.created_at,
      type: item.type,
    })),
    companyScore: raw.company_score
      ? {
          finalScore: raw.company_score.final_score,
          popularityScore: raw.company_score.popularity_score,
          engagementScore: raw.company_score.engagement_score,
          conversionScore: raw.company_score.conversion_score,
          trustScore: raw.company_score.trust_score,
          freshnessScore: raw.company_score.freshness_score,
          calculatedAt: raw.company_score.calculated_at,
        }
      : null,
    verificationSummary: raw.verification_summary
      ? {
          level: raw.verification_summary.level,
          statusLabel: raw.verification_summary.status_label,
          statusTone: raw.verification_summary.status_tone,
          score: raw.verification_summary.score,
          lastReviewAt: raw.verification_summary.last_review_at ?? null,
          checksCompleted: raw.verification_summary.checks_completed,
          checksTotal: raw.verification_summary.checks_total,
        }
      : null,
    branchPerformance: raw.branch_performance.map((item) => ({
      branchId: item.branch_id,
      branchName: item.branch_name,
      districtName: item.district_name,
      finalScore: item.final_score,
      visits30d: item.visits_30d,
      reviews90d: item.reviews_90d,
      avgRating90d: item.avg_rating_90d,
      isMain: item.is_main,
    })),
  };
}