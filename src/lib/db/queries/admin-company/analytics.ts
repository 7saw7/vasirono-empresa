import { serviceRequest, serviceRequestOptional } from "@/lib/http/service-client";
import {
  asArray,
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
  _companyId: number,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsOverview> {
  const [overview, trafficSeries, scoreHistory, funnel, branches, sourceBreakdown] =
    await Promise.all([
      serviceRequestOptional<unknown>({
        service: "analytics",
        directPath: "/api/company/analytics/overview",
        gatewayPath: "/api/analytics/api/company/analytics/overview",
        query: filters,
      }),
      serviceRequestOptional<unknown>({
        service: "analytics",
        directPath: "/api/company/analytics/traffic-series",
        gatewayPath: "/api/analytics/api/company/analytics/traffic-series",
        query: filters,
      }),
      serviceRequestOptional<unknown>({
        service: "analytics",
        directPath: "/api/company/analytics/score-history",
        gatewayPath: "/api/analytics/api/company/analytics/score-history",
        query: filters,
      }),
      serviceRequestOptional<unknown>({
        service: "analytics",
        directPath: "/api/company/analytics/funnel",
        gatewayPath: "/api/analytics/api/company/analytics/funnel",
        query: filters,
      }),
      serviceRequestOptional<unknown>({
        service: "analytics",
        directPath: "/api/company/analytics/branches",
        gatewayPath: "/api/analytics/api/company/analytics/branches",
        query: filters,
      }),
      serviceRequestOptional<unknown>({
        service: "analytics",
        directPath: "/api/company/analytics/source-breakdown",
        gatewayPath: "/api/analytics/api/company/analytics/source-breakdown",
        query: filters,
      }),
    ]);

  const overviewRow = asRecord(overview);

  return {
    summary: {
      profileViews: toNumber(
        pick(overviewRow, "profileViews", "profile_views", "views")
      ),
      favoritesAdded: toNumber(
        pick(overviewRow, "favoritesAdded", "favorites_added", "favorites")
      ),
      contactClicks: toNumber(
        pick(overviewRow, "contactClicks", "contact_clicks")
      ),
      reviewsGenerated: toNumber(
        pick(overviewRow, "reviewsGenerated", "reviews_generated", "reviews")
      ),
    },
    trafficSeries: normalizePoints(trafficSeries),
    scoreHistory: normalizePoints(scoreHistory),
    funnel: normalizeFunnel(funnel),
    branchRanking: normalizeBranchRanking(branches),
    sourceBreakdown: normalizeSourceBreakdown(sourceBreakdown),
  };
}

export async function getAnalyticsBranchRankingQuery(
  _companyId: number,
  filters: AnalyticsFilters = {}
): Promise<BranchRankingItem[]> {
  const payload = await serviceRequest<unknown>({
    service: "analytics",
    directPath: "/api/company/analytics/branches",
    gatewayPath: "/api/analytics/api/company/analytics/branches",
    query: filters,
    errorCode: "ANALYTICS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el ranking de sucursales.",
  });

  return normalizeBranchRanking(payload);
}


export async function getAnalyticsFunnelQuery(
  _companyId: number,
  filters: AnalyticsFilters = {}
): Promise<FunnelStep[]> {
  const payload = await serviceRequest<unknown>({
    service: "analytics",
    directPath: "/api/company/analytics/funnel",
    gatewayPath: "/api/analytics/api/company/analytics/funnel",
    query: filters,
    errorCode: "ANALYTICS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el funnel analítico.",
  });

  return normalizeFunnel(payload);
}

export async function getAnalyticsTrafficSeriesQuery(
  _companyId: number,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsPoint[]> {
  const payload = await serviceRequest<unknown>({
    service: "analytics",
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

  for (const key of ["items", "data", "rows", "series", "points", "branches", "ranking", "sources", "steps"]) {
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
      pick(item, "contactClicks30d", "contact_clicks_30d", "contactClicks", "contact_clicks")
    ),
  }));
}

function normalizeSourceBreakdown(value: unknown): SourceBreakdownItem[] {
  return unwrapRows(value).map((item) => ({
    source: toStringValue(pick(item, "source", "eventSource", "event_source"), "direct"),
    visitsCount: toNumber(pick(item, "visitsCount", "visits_count", "visits")),
    favoritesCount: toNumber(
      pick(item, "favoritesCount", "favorites_count", "favorites")
    ),
    contactClicks: toNumber(
      pick(item, "contactClicks", "contact_clicks")
    ),
    reviewsCount: toNumber(pick(item, "reviewsCount", "reviews_count", "reviews")),
  }));
}
