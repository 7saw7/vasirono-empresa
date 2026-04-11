import { getDb } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { mapDashboardData } from "@/features/admin-company/dashboard/mapper";
import { validateDashboardData } from "@/features/admin-company/dashboard/schema";
import type {
  RawDashboardActivityItem,
  RawDashboardBranchPerformanceItem,
  RawDashboardCompanyScore,
  RawDashboardKpi,
  RawDashboardPayload,
  RawDashboardVerificationSummary,
} from "@/features/admin-company/dashboard/raw-types";

export async function getDashboardQuery(companyId: number) {
  const db = getDb();

  const companyRows = await db.query<{ company_name: string }>(
    `
      select
        c.name as company_name
      from companies c
      where c.id = $1
      limit 1
    `,
    [companyId]
  );

  const company = companyRows[0];

  if (!company) {
    throw new AppError(
      "NOT_FOUND",
      "No se encontró la empresa del dashboard.",
      404
    );
  }

  const kpis = await db.query<RawDashboardKpi>(
    `
      select * from (
        select
          'views' as id,
          'Visitas 30 días' as label,
          coalesce(sum(b.visits_30d), 0) as value,
          'Tráfico agregado de tus sucursales.' as helper,
          null::text as trend_value,
          'neutral' as trend_direction
        from company_branches b
        where b.company_id = $1

        union all

        select
          'reviews' as id,
          'Reseñas 90 días' as label,
          coalesce(sum(b.reviews_90d), 0) as value,
          'Volumen reciente de reseñas recibidas.' as helper,
          null::text as trend_value,
          'neutral' as trend_direction
        from company_branches b
        where b.company_id = $1

        union all

        select
          'rating' as id,
          'Rating promedio' as label,
          coalesce(round(avg(b.avg_rating_90d)::numeric, 1)::text || ' / 5', '0 / 5') as value,
          'Promedio consolidado del negocio.' as helper,
          null::text as trend_value,
          'neutral' as trend_direction
        from company_branches b
        where b.company_id = $1

        union all

        select
          'branches' as id,
          'Sucursales activas' as label,
          coalesce(count(*) filter (where b.is_active = true), 0) as value,
          'Sucursales visibles en la plataforma.' as helper,
          null::text as trend_value,
          'neutral' as trend_direction
        from company_branches b
        where b.company_id = $1
      ) k
    `,
    [companyId]
  );

  const branchPerformance = await db.query<RawDashboardBranchPerformanceItem>(
    `
      select
        b.branch_id,
        b.name as branch_name,
        coalesce(b.district_name, 'Sin distrito') as district_name,
        coalesce(b.final_score, 0) as final_score,
        coalesce(b.visits_30d, 0) as visits_30d,
        coalesce(b.reviews_90d, 0) as reviews_90d,
        coalesce(b.avg_rating_90d, 0) as avg_rating_90d,
        coalesce(b.is_main, false) as is_main
      from company_branches b
      where b.company_id = $1
      order by coalesce(b.final_score, 0) desc, b.name asc
      limit 10
    `,
    [companyId]
  );

  const companyScoreRows = await db.query<RawDashboardCompanyScore>(
    `
      select
        coalesce(c.final_score, 0) as final_score,
        coalesce(c.popularity_score, 0) as popularity_score,
        coalesce(c.engagement_score, 0) as engagement_score,
        coalesce(c.conversion_score, 0) as conversion_score,
        coalesce(c.trust_score, 0) as trust_score,
        coalesce(c.freshness_score, 0) as freshness_score,
        coalesce(c.score_calculated_at::text, now()::text) as calculated_at
      from companies c
      where c.id = $1
      limit 1
    `,
    [companyId]
  );

  const verificationRows = await db.query<RawDashboardVerificationSummary>(
    `
      select
        coalesce(v.level, 'Pendiente') as level,
        coalesce(v.status_label, 'Sin revisión') as status_label,
        coalesce(v.status_tone, 'default') as status_tone,
        coalesce(v.score, 0) as score,
        v.last_review_at::text as last_review_at,
        coalesce(v.checks_completed, 0) as checks_completed,
        coalesce(v.checks_total, 0) as checks_total
      from company_verification_summary v
      where v.company_id = $1
      limit 1
    `,
    [companyId]
  );

  const activityRows = await db.query<RawDashboardActivityItem>(
    `
      select
        a.id::text as id,
        a.title,
        a.description,
        a.created_at::text as created_at,
        a.type
      from company_activity_feed a
      where a.company_id = $1
      order by a.created_at desc
      limit 10
    `,
    [companyId]
  );

  const raw: RawDashboardPayload = {
    company_name: company.company_name,
    kpis,
    recent_activity: activityRows,
    company_score: companyScoreRows[0] ?? null,
    verification_summary: verificationRows[0] ?? null,
    branch_performance: branchPerformance,
  };

  return validateDashboardData(mapDashboardData(raw));
}