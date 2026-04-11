export type RawDashboardKpi = {
  id: string;
  label: string;
  value: number | string;
  helper?: string | null;
  trend_value?: string | null;
  trend_direction?: "up" | "down" | "neutral" | null;
};

export type RawDashboardActivityItem = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type:
    | "review"
    | "verification"
    | "branch"
    | "analytics"
    | "company"
    | "system";
};

export type RawDashboardCompanyScore = {
  final_score: number;
  popularity_score: number;
  engagement_score: number;
  conversion_score: number;
  trust_score: number;
  freshness_score: number;
  calculated_at: string;
};

export type RawDashboardVerificationSummary = {
  level: string;
  status_label: string;
  status_tone: "default" | "success" | "warning" | "danger" | "info";
  score: number;
  last_review_at?: string | null;
  checks_completed: number;
  checks_total: number;
};

export type RawDashboardBranchPerformanceItem = {
  branch_id: number;
  branch_name: string;
  district_name: string;
  final_score: number;
  visits_30d: number;
  reviews_90d: number;
  avg_rating_90d: number;
  is_main: boolean;
};

export type RawDashboardPayload = {
  company_name: string;
  kpis: RawDashboardKpi[];
  recent_activity: RawDashboardActivityItem[];
  company_score: RawDashboardCompanyScore | null;
  verification_summary: RawDashboardVerificationSummary | null;
  branch_performance: RawDashboardBranchPerformanceItem[];
};