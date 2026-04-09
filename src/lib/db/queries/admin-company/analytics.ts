import { getDb } from "@/lib/db/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { mapAnalyticsOverview } from "@/features/admin-company/analytics/mapper";
import type { AnalyticsFilters } from "@/features/admin-company/analytics/types";

export async function getAnalyticsOverviewQuery(filters: AnalyticsFilters = {}) {
  const db = getDb();
  const { companyId } = await getCompanyContext();

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
      TO_CHAR(snapshot_date, 'Dy') AS label,
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
      TO_CHAR(snapshot_date, 'Mon') AS label,
      AVG(final_score)::numeric AS value
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
      d.name AS district_name,
      abs.final_score,
      abs.visits_30d,
      abs.favorites_30d,
      abs.contact_clicks_30d
    FROM analytics_branch_scores abs
    INNER JOIN company_branches cb ON cb.branch_id = abs.branch_id
    INNER JOIN districts d ON d.district_id = cb.district_id
    WHERE abs.company_id = $1
    ORDER BY abs.final_score DESC
    LIMIT 20
  `;

  const sourceBreakdownSql = `
    SELECT
      source,
      COALESCE(SUM(visits_count), 0)::int AS visits_count,
      COALESCE(SUM(favorites_count), 0)::int AS favorites_count,
      COALESCE(SUM(contact_clicks), 0)::int AS contact_clicks,
      COALESCE(SUM(reviews_count), 0)::int AS reviews_count
    FROM analytics_branch_daily_sources abds
    INNER JOIN company_branches cb ON cb.branch_id = abds.branch_id
    WHERE cb.company_id = $1
      AND ($2::int IS NULL OR abds.branch_id = $2::int)
      AND ($3::text IS NULL OR source = $3::text)
    GROUP BY source
    ORDER BY visits_count DESC
  `;

  const [summaryRows, trafficRows, scoreRows, funnelRows, branchRows, sourceRows] =
    await Promise.all([
      db.query<{
        profile_views: number;
        favorites_added: number;
        contact_clicks: number;
        reviews_generated: number;
      }>(summarySql, [companyId, filters.from ?? null, filters.to ?? null, filters.branchId ?? null]),
      db.query<{ label: string; value: number }>(trafficSql, [
        companyId,
        filters.from ?? null,
        filters.to ?? null,
        filters.branchId ?? null,
      ]),
      db.query<{ label: string; value: number }>(scoreHistorySql, [
        companyId,
        filters.from ?? null,
        filters.to ?? null,
      ]),
      db.query<{
        profile_views: number;
        favorites_added: number;
        promotion_opens: number;
        contact_clicks: number;
        claim_submissions: number;
      }>(funnelSql, [companyId, filters.from ?? null, filters.to ?? null, filters.branchId ?? null]),
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
      }>(sourceBreakdownSql, [companyId, filters.branchId ?? null, filters.source ?? null]),
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