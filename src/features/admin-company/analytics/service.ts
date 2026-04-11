import type {
  AnalyticsFilters,
  AnalyticsOverview,
  BranchRankingItem,
  FunnelStep,
} from "./types";

function toQueryString(filters: AnalyticsFilters = {}) {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (typeof filters.branchId === "number") {
    params.set("branchId", String(filters.branchId));
  }
  if (filters.source) params.set("source", filters.source);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getAnalyticsOverview(
  filters: AnalyticsFilters = {}
): Promise<AnalyticsOverview> {
  const response = await fetch(
    `/api/admin-company/analytics/overview${toQueryString(filters)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar el overview de analytics."
    );
  }

  return payload.data as AnalyticsOverview;
}

export async function getAnalyticsBranchRanking(): Promise<BranchRankingItem[]> {
  const response = await fetch("/api/admin-company/analytics/branches", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar el ranking de sucursales."
    );
  }

  return payload.data as BranchRankingItem[];
}

export async function getAnalyticsFunnel(
  filters: AnalyticsFilters = {}
): Promise<FunnelStep[]> {
  const response = await fetch(
    `/api/admin-company/analytics/funnel${toQueryString(filters)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar el funnel de analytics."
    );
  }

  return payload.data as FunnelStep[];
}