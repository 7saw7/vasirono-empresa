export type AnalyticsFilters = {
  from?: string;
  to?: string;
  branchId?: number;
  source?: string;
};

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export type FunnelStep = {
  key: string;
  label: string;
  value: number;
};

export type BranchRankingItem = {
  branchId: number;
  branchName: string;
  districtName: string;
  finalScore: number;
  visits30d: number;
  favorites30d: number;
  contactClicks30d: number;
};

export type SourceBreakdownItem = {
  source: string;
  visitsCount: number;
  favoritesCount: number;
  contactClicks: number;
  reviewsCount: number;
};

export type AnalyticsOverview = {
  summary: {
    profileViews: number;
    favoritesAdded: number;
    contactClicks: number;
    reviewsGenerated: number;
  };
  trafficSeries: AnalyticsPoint[];
  scoreHistory: AnalyticsPoint[];
  funnel: FunnelStep[];
  branchRanking: BranchRankingItem[];
  sourceBreakdown: SourceBreakdownItem[];
};