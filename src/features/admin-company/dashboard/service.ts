import { mapDashboardData } from "./mapper";
import type { DashboardData } from "./types";

export async function getDashboardData(): Promise<DashboardData> {
  /**
   * Default temporal.
   * Luego puedes cambiar por fetch("/api/admin-company/dashboard")
   */
  const raw = {
    company_name: "Makis Premium Perú",
    kpis: [
      {
        id: "views",
        label: "Visitas 30 días",
        value: 12480,
        helper: "Tráfico agregado de tus sucursales.",
        trend_value: "+8.4%",
        trend_direction: "up" as const,
      },
      {
        id: "reviews",
        label: "Reseñas 90 días",
        value: 286,
        helper: "Volumen reciente de reseñas recibidas.",
        trend_value: "+4.1%",
        trend_direction: "up" as const,
      },
      {
        id: "rating",
        label: "Rating promedio",
        value: "4.7 / 5",
        helper: "Promedio consolidado del negocio.",
        trend_value: "+0.2",
        trend_direction: "up" as const,
      },
      {
        id: "branches",
        label: "Sucursales activas",
        value: 6,
        helper: "Sucursales visibles en la plataforma.",
        trend_value: "0%",
        trend_direction: "neutral" as const,
      },
    ],
    recent_activity: [
      {
        id: "act-1",
        title: "Nueva reseña recibida",
        description: "Sucursal San Juan de Miraflores recibió una reseña de 5★.",
        created_at: new Date().toISOString(),
        type: "review" as const,
      },
      {
        id: "act-2",
        title: "Documento verificado",
        description: "Se aprobó un documento del flujo de verificación empresarial.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        type: "verification" as const,
      },
      {
        id: "act-3",
        title: "Subida de score empresarial",
        description: "El score consolidado subió por mejora en engagement.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        type: "analytics" as const,
      },
    ],
    company_score: {
      final_score: 87.4,
      popularity_score: 84.1,
      engagement_score: 89.6,
      conversion_score: 78.2,
      trust_score: 92.1,
      freshness_score: 86.4,
      calculated_at: new Date().toISOString(),
    },
    verification_summary: {
      level: "Avanzado",
      status_label: "En revisión",
      status_tone: "warning" as const,
      score: 82,
      last_review_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      checks_completed: 4,
      checks_total: 6,
    },
    branch_performance: [
      {
        branch_id: 1,
        branch_name: "Makis Premium - VES",
        district_name: "Villa El Salvador",
        final_score: 91.3,
        visits_30d: 4120,
        reviews_90d: 74,
        avg_rating_90d: 4.8,
        is_main: true,
      },
      {
        branch_id: 2,
        branch_name: "Makis Premium - SJM",
        district_name: "San Juan de Miraflores",
        final_score: 86.7,
        visits_30d: 3588,
        reviews_90d: 61,
        avg_rating_90d: 4.6,
        is_main: false,
      },
      {
        branch_id: 3,
        branch_name: "Makis Premium - Chorrillos",
        district_name: "Chorrillos",
        final_score: 82.9,
        visits_30d: 2140,
        reviews_90d: 39,
        avg_rating_90d: 4.5,
        is_main: false,
      },
    ],
  };

  return mapDashboardData(raw);
}