export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  helper?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type:
    | "review"
    | "verification"
    | "branch"
    | "analytics"
    | "company"
    | "system";
};

export type DashboardCompanyScore = {
  finalScore: number;
  popularityScore: number;
  engagementScore: number;
  conversionScore: number;
  trustScore: number;
  freshnessScore: number;
  calculatedAt: string;
};

export type DashboardVerificationSummary = {
  level: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "danger" | "info";
  score: number;
  lastReviewAt?: string | null;
  checksCompleted: number;
  checksTotal: number;
};

export type DashboardBranchPerformanceItem = {
  branchId: number;
  branchName: string;
  districtName: string;
  finalScore: number;
  visits30d: number;
  reviews90d: number;
  avgRating90d: number;
  isMain: boolean;
};

export type DashboardData = {
  companyName: string;
  kpis: DashboardKpi[];
  recentActivity: DashboardActivityItem[];
  companyScore: DashboardCompanyScore | null;
  verificationSummary: DashboardVerificationSummary | null;
  branchPerformance: DashboardBranchPerformanceItem[];
};