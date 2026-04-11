import { getDb } from "@/lib/db/server";
import { mapAnalyticsOverview, mapBranchRankingItem, mapFunnelStep } from "@/features/admin-company/analytics/mapper";
import type {
  AnalyticsFilters,
  BranchRankingItem,
  FunnelStep,
  SourceBreakdownItem,
  AnalyticsOverview,
} from "@/features/admin-company/analytics/types";

function normalizeDateRange(filters: AnalyticsFilters) {
  return {
    from: filters.from ?? null,
    to: filters.to ?? null,
    branchId: filters.branchId ?? null,
    source: filters.source ?? null,
  };
}

export async function getAnalyticsOverviewQuery(
  companyId: number,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsOverview> {
  const db = getDb();
  const range = normalizeDateRange(filters);

  const summarySql = `
    SELECT
      COALESCE(SUM(profile_views), 0)::int AS profile_views,
      COALESCE(SUM(favorites_added), 0)::int AS favorites_added,
      COALESCE(SUM(contact_clicks), 0)::int AS contact_clicks,
      COALESCE(SUM(claim_submissions), 0)::int AS reviews_generated
    FROM analytics_conversion_funnel_daily
    WHERE company_id = $1
      AND ($2::date IS NULL OR snapshot_date >= $2::date)
      AND ($3::date IS NULL OR snapshot_date <= $3::date)
      AND ($4::int IS NULL OR branch_id = $4::int)
  `;

  const trafficSql = `
    SELECT
      TO_CHAR(snapshot_date, 'YYYY-MM-DD') AS label,
      COALESCE(SUM(profile_views), 0)::int AS value
    FROM analytics_conversion_funnel_daily
    WHERE company_id = $1
      AND ($2::date IS NULL OR snapshot_date >= $2::date)
      AND ($3::date IS NULL OR snapshot_date <= $3::date)
      AND ($4::int IS NULL OR branch_id = $4::int)
    GROUP BY snapshot_date
    ORDER BY snapshot_date ASC
    LIMIT 31
  `;

  const scoreHistorySql = `
    SELECT
      TO_CHAR(snapshot_date, 'YYYY-MM-DD') AS label,
      COALESCE(ROUND(AVG(final_score)::numeric, 2), 0)::float AS value
    FROM analytics_company_scores_history
    WHERE company_id = $1
      AND ($2::date IS NULL OR snapshot_date >= $2::date)
      AND ($3::date IS NULL OR snapshot_date <= $3::date)
    GROUP BY snapshot_date
    ORDER BY snapshot_date ASC
    LIMIT 12
  `;

  const funnelSql = `
    SELECT
      COALESCE(SUM(profile_views), 0)::int AS profile_views,
      COALESCE(SUM(favorites_added), 0)::int AS favorites_added,
      COALESCE(SUM(promotion_opens), 0)::int AS promotion_opens,
      COALESCE(SUM(contact_clicks), 0)::int AS contact_clicks,
      COALESCE(SUM(claim_submissions), 0)::int AS claim_submissions
    FROM analytics_conversion_funnel_daily
    WHERE company_id = $1
      AND ($2::date IS NULL OR snapshot_date >= $2::date)
      AND ($3::date IS NULL OR snapshot_date <= $3::date)
      AND ($4::int IS NULL OR branch_id = $4::int)
  `;

  const branchRankingSql = `
    SELECT
      abs.branch_id,
      cb.name AS branch_name,
      COALESCE(d.name, 'Sin distrito') AS district_name,
      COALESCE(abs.final_score, 0)::float AS final_score,
      COALESCE(abs.visits_30d, 0)::int AS visits_30d,
      COALESCE(abs.favorites_30d, 0)::int AS favorites_30d,
      COALESCE(abs.contact_clicks_30d, 0)::int AS contact_clicks_30d
    FROM analytics_branch_scores abs
    INNER JOIN company_branches cb ON cb.branch_id = abs.branch_id
    LEFT JOIN districts d ON d.id = cb.district_id
    WHERE abs.company_id = $1
    ORDER BY abs.final_score DESC, cb.name ASC
    LIMIT 20
  `;

  const sourceBreakdownSql = `
    SELECT
      abds.source,
      COALESCE(SUM(abds.visits_count), 0)::int AS visits_count,
      COALESCE(SUM(abds.favorites_count), 0)::int AS favorites_count,
      COALESCE(SUM(abds.contact_clicks), 0)::int AS contact_clicks,
      COALESCE(SUM(abds.reviews_count), 0)::int AS reviews_count
    FROM analytics_branch_daily_sources abds
    INNER JOIN company_branches cb ON cb.branch_id = abds.branch_id
    WHERE cb.company_id = $1
      AND ($2::int IS NULL OR abds.branch_id = $2::int)
      AND ($3::text IS NULL OR abds.source = $3::text)
    GROUP BY abds.source
    ORDER BY visits_count DESC, abds.source ASC
  `;

  const [
    summaryRows,
    trafficRows,
    scoreRows,
    funnelRows,
    branchRows,
    sourceRows,
  ] = await Promise.all([
    db.query<{
      profile_views: number;
      favorites_added: number;
      contact_clicks: number;
      reviews_generated: number;
    }>(summarySql, [companyId, range.from, range.to, range.branchId]),
    db.query<{ label: string; value: number }>(trafficSql, [
      companyId,
      range.from,
      range.to,
      range.branchId,
    ]),
    db.query<{ label: string; value: number }>(scoreHistorySql, [
      companyId,
      range.from,
      range.to,
    ]),
    db.query<{
      profile_views: number;
      favorites_added: number;
      promotion_opens: number;
      contact_clicks: number;
      claim_submissions: number;
    }>(funnelSql, [companyId, range.from, range.to, range.branchId]),
    db.query<{
      branch_id: number;
      branch_name: string;
      district_name: string;
      final_score: number;
      visits_30d: number;
      favorites_30d: number;
      contact_clicks_30d: number;
    }>(branchRankingSql, [companyId]),
    db.query<{
      source: string;
      visits_count: number;
      favorites_count: number;
      contact_clicks: number;
      reviews_count: number;
    }>(sourceBreakdownSql, [companyId, range.branchId, range.source]),
  ]);

  const summary = summaryRows[0] ?? {
    profile_views: 0,
    favorites_added: 0,
    contact_clicks: 0,
    reviews_generated: 0,
  };

  const funnel = funnelRows[0] ?? {
    profile_views: 0,
    favorites_added: 0,
    promotion_opens: 0,
    contact_clicks: 0,
    claim_submissions: 0,
  };

  return mapAnalyticsOverview({
    summary,
    traffic_series: trafficRows,
    score_history: scoreRows,
    funnel: [
      { key: "views", label: "Vistas perfil", value: funnel.profile_views },
      { key: "favorites", label: "Favoritos", value: funnel.favorites_added },
      { key: "promotions", label: "Promos abiertas", value: funnel.promotion_opens },
      { key: "contacts", label: "Clicks contacto", value: funnel.contact_clicks },
      { key: "claims", label: "Claims enviados", value: funnel.claim_submissions },
    ],
    branch_ranking: branchRows,
    source_breakdown: sourceRows,
  });
}

export async function getAnalyticsBranchRankingQuery(
  companyId: number
): Promise<BranchRankingItem[]> {
  const db = getDb();

  const rows = await db.query<{
    branch_id: number;
    branch_name: string;
    district_name: string;
    final_score: number;
    visits_30d: number;
    favorites_30d: number;
    contact_clicks_30d: number;
  }>(
    `
      SELECT
        abs.branch_id,
        cb.name AS branch_name,
        COALESCE(d.name, 'Sin distrito') AS district_name,
        COALESCE(abs.final_score, 0)::float AS final_score,
        COALESCE(abs.visits_30d, 0)::int AS visits_30d,
        COALESCE(abs.favorites_30d, 0)::int AS favorites_30d,
        COALESCE(abs.contact_clicks_30d, 0)::int AS contact_clicks_30d
      FROM analytics_branch_scores abs
      INNER JOIN company_branches cb ON cb.branch_id = abs.branch_id
      LEFT JOIN districts d ON d.id = cb.district_id
      WHERE abs.company_id = $1
      ORDER BY abs.final_score DESC, cb.name ASC
      LIMIT 20
    `,
    [companyId]
  );

  return rows.map(mapBranchRankingItem);
}

export async function getAnalyticsFunnelQuery(
  companyId: number,
  filters: AnalyticsFilters = {}
): Promise<FunnelStep[]> {
  const db = getDb();
  const range = normalizeDateRange(filters);

  const rows = await db.query<{
    profile_views: number;
    favorites_added: number;
    promotion_opens: number;
    contact_clicks: number;
    claim_submissions: number;
  }>(
    `
      SELECT
        COALESCE(SUM(profile_views), 0)::int AS profile_views,
        COALESCE(SUM(favorites_added), 0)::int AS favorites_added,
        COALESCE(SUM(promotion_opens), 0)::int AS promotion_opens,
        COALESCE(SUM(contact_clicks), 0)::int AS contact_clicks,
        COALESCE(SUM(claim_submissions), 0)::int AS claim_submissions
      FROM analytics_conversion_funnel_daily
      WHERE company_id = $1
        AND ($2::date IS NULL OR snapshot_date >= $2::date)
        AND ($3::date IS NULL OR snapshot_date <= $3::date)
        AND ($4::int IS NULL OR branch_id = $4::int)
    `,
    [companyId, range.from, range.to, range.branchId]
  );

  const funnel = rows[0] ?? {
    profile_views: 0,
    favorites_added: 0,
    promotion_opens: 0,
    contact_clicks: 0,
    claim_submissions: 0,
  };

  return [
    { key: "views", label: "Vistas perfil", value: funnel.profile_views },
    { key: "favorites", label: "Favoritos", value: funnel.favorites_added },
    { key: "promotions", label: "Promos abiertas", value: funnel.promotion_opens },
    { key: "contacts", label: "Clicks contacto", value: funnel.contact_clicks },
    { key: "claims", label: "Claims enviados", value: funnel.claim_submissions },
  ].map(mapFunnelStep);
}