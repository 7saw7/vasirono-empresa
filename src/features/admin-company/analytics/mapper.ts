import type {
  AnalyticsOverview,
  AnalyticsPoint,
  BranchRankingItem,
  FunnelStep,
  SourceBreakdownItem,
} from "./types";

export function mapAnalyticsPoint(raw: { label: string; value: number }): AnalyticsPoint {
  return raw;
}

export function mapFunnelStep(raw: { key: string; label: string; value: number }): FunnelStep {
  return raw;
}

export function mapBranchRankingItem(raw: {
  branch_id: number;
  branch_name: string;
  district_name: string;
  final_score: number;
  visits_30d: number;
  favorites_30d: number;
  contact_clicks_30d: number;
}): BranchRankingItem {
  return {
    branchId: raw.branch_id,
    branchName: raw.branch_name,
    districtName: raw.district_name,
    finalScore: raw.final_score,
    visits30d: raw.visits_30d,
    favorites30d: raw.favorites_30d,
    contactClicks30d: raw.contact_clicks_30d,
  };
}

export function mapSourceBreakdownItem(raw: {
  source: string;
  visits_count: number;
  favorites_count: number;
  contact_clicks: number;
  reviews_count: number;
}): SourceBreakdownItem {
  return {
    source: raw.source,
    visitsCount: raw.visits_count,
    favoritesCount: raw.favorites_count,
    contactClicks: raw.contact_clicks,
    reviewsCount: raw.reviews_count,
  };
}

export function mapAnalyticsOverview(raw: {
  summary: {
    profile_views: number;
    favorites_added: number;
    contact_clicks: number;
    reviews_generated: number;
  };
  traffic_series: Array<{ label: string; value: number }>;
  score_history: Array<{ label: string; value: number }>;
  funnel: Array<{ key: string; label: string; value: number }>;
  branch_ranking: Array<{
    branch_id: number;
    branch_name: string;
    district_name: string;
    final_score: number;
    visits_30d: number;
    favorites_30d: number;
    contact_clicks_30d: number;
  }>;
  source_breakdown: Array<{
    source: string;
    visits_count: number;
    favorites_count: number;
    contact_clicks: number;
    reviews_count: number;
  }>;
}): AnalyticsOverview {
  return {
    summary: {
      profileViews: raw.summary.profile_views,
      favoritesAdded: raw.summary.favorites_added,
      contactClicks: raw.summary.contact_clicks,
      reviewsGenerated: raw.summary.reviews_generated,
    },
    trafficSeries: raw.traffic_series.map(mapAnalyticsPoint),
    scoreHistory: raw.score_history.map(mapAnalyticsPoint),
    funnel: raw.funnel.map(mapFunnelStep),
    branchRanking: raw.branch_ranking.map(mapBranchRankingItem),
    sourceBreakdown: raw.source_breakdown.map(mapSourceBreakdownItem),
  };
}