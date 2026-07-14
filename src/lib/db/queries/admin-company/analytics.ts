import { serviceRequest } from "@/lib/http/service-client";
import {
  asRecord,
  pick,
  toNumber,
  toStringValue,
  type AnyRecord,
} from "@/lib/http/service-data";
import type {
  AnalyticsFilters,
  AnalyticsOverview,
  AnalyticsPoint,
  BranchRankingItem,
  FunnelStep,
  SourceBreakdownItem,
} from "@/features/admin-company/analytics/types";

export async function getAnalyticsOverviewQuery(
  companyId: number,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsOverview> {
  const overview = await serviceRequest<unknown>({
    service: "analytics",
    companyId,
    directPath: "/api/company/analytics/overview",
    gatewayPath: "/api/analytics/api/company/analytics/overview",
    query: filters,
    errorCode: "ANALYTICS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar Analytics.",
  });

  const overviewRow = asRecord(overview);
  const summaryRow = asRecord(
    pick(overviewRow, "summary", "overview", "totals")
  );

  return {
    summary: {
      profileViews: toNumber(
        pick(summaryRow, "profileViews", "profile_views", "views")
      ),
      favoritesAdded: toNumber(
        pick(summaryRow, "favoritesAdded", "favorites_added", "favorites")
      ),
      contactClicks: toNumber(
        pick(summaryRow, "contactClicks", "contact_clicks")
      ),
      reviewsGenerated: toNumber(
        pick(summaryRow, "reviewsGenerated", "reviews_generated", "reviews")
      ),
    },
    trafficSeries: normalizePoints(
      pick(overviewRow, "trafficSeries", "traffic_series")
    ),
    scoreHistory: normalizePoints(
      pick(overviewRow, "scoreHistory", "score_history")
    ),
    funnel: normalizeFunnel(pick(overviewRow, "funnel", "steps")),
    branchRanking: normalizeBranchRanking(
      pick(overviewRow, "branchRanking", "branch_ranking", "branches", "ranking")
    ),
    sourceBreakdown: normalizeSourceBreakdown(
      pick(overviewRow, "sourceBreakdown", "source_breakdown", "sources")
    ),
  };
}

export async function getAnalyticsBranchRankingQuery(
  companyId: number,
  filters: AnalyticsFilters = {}
): Promise<BranchRankingItem[]> {
  const payload = await serviceRequest<unknown>({
    service: "analytics",
    companyId,
    directPath: "/api/company/analytics/branches",
    gatewayPath: "/api/analytics/api/company/analytics/branches",
    query: filters,
    errorCode: "ANALYTICS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el ranking de sucursales.",
  });

  return normalizeBranchRanking(payload);
}

export async function getAnalyticsFunnelQuery(
  companyId: number,
  filters: AnalyticsFilters = {}
): Promise<FunnelStep[]> {
  const payload = await serviceRequest<unknown>({
    service: "analytics",
    companyId,
    directPath: "/api/company/analytics/funnel",
    gatewayPath: "/api/analytics/api/company/analytics/funnel",
    query: filters,
    errorCode: "ANALYTICS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el funnel analítico.",
  });

  return normalizeFunnel(payload);
}

export async function getAnalyticsTrafficSeriesQuery(
  companyId: number,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsPoint[]> {
  const payload = await serviceRequest<unknown>({
    service: "analytics",
    companyId,
    directPath: "/api/company/analytics/traffic-series",
    gatewayPath: "/api/analytics/api/company/analytics/traffic-series",
    query: filters,
    errorCode: "ANALYTICS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar la serie de tráfico.",
  });

  return normalizePoints(payload);
}

function unwrapRows(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.map(asRecord);

  const row = asRecord(value);

  for (const key of [
    "items",
    "data",
    "rows",
    "series",
    "points",
    "branches",
    "ranking",
    "sources",
    "steps",
  ]) {
    const candidate = row[key];
    if (Array.isArray(candidate)) return candidate.map(asRecord);
  }

  return [];
}

function normalizePoints(value: unknown): AnalyticsPoint[] {
  return unwrapRows(value).map((item) => ({
    label: toStringValue(
      pick(item, "label", "date", "day", "period", "snapshotDate", "snapshot_date"),
      "—"
    ),
    value: toNumber(pick(item, "value", "count", "score", "total")),
  }));
}

function normalizeFunnel(value: unknown): FunnelStep[] {
  return unwrapRows(value).map((item, index) => ({
    key: toStringValue(pick(item, "key", "code"), `step-${index}`),
    label: toStringValue(pick(item, "label", "name"), "Etapa"),
    value: toNumber(pick(item, "value", "count", "total")),
  }));
}

function normalizeBranchRanking(value: unknown): BranchRankingItem[] {
  return unwrapRows(value).map((item) => ({
    branchId: toNumber(pick(item, "branchId", "branch_id", "id")),
    branchName: toStringValue(
      pick(item, "branchName", "branch_name", "name"),
      "Sucursal"
    ),
    districtName: toStringValue(
      pick(item, "districtName", "district_name"),
      "Sin distrito"
    ),
    finalScore: toNumber(pick(item, "finalScore", "final_score", "score")),
    visits30d: toNumber(pick(item, "visits30d", "visits_30d", "visits")),
    favorites30d: toNumber(
      pick(item, "favorites30d", "favorites_30d", "favorites")
    ),
    contactClicks30d: toNumber(
      pick(
        item,
        "contactClicks30d",
        "contact_clicks_30d",
        "contactClicks",
        "contact_clicks"
      )
    ),
  }));
}

function normalizeSourceBreakdown(value: unknown): SourceBreakdownItem[] {
  return unwrapRows(value).map((item) => ({
    source: toStringValue(
      pick(item, "source", "eventSource", "event_source"),
      "direct"
    ),
    visitsCount: toNumber(pick(item, "visitsCount", "visits_count", "visits")),
    favoritesCount: toNumber(
      pick(item, "favoritesCount", "favorites_count", "favorites")
    ),
    contactClicks: toNumber(pick(item, "contactClicks", "contact_clicks")),
    reviewsCount: toNumber(
      pick(item, "reviewsCount", "reviews_count", "reviews")
    ),
  }));
}
