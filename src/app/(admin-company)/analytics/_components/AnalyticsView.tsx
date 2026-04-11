import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatCard } from "@/components/ui/StatCard";
import type { AnalyticsOverview } from "@/features/admin-company/analytics/types";
import { BranchRankingTable } from "./BranchRankingTable";
import { FunnelChart } from "./FunnelChart";
import { SourceBreakdownTable } from "./SourceBreakdownTable";
import { TrendChart } from "./TrendChart";

export default function AnalyticsView({
  overview,
}: {
  overview: AnalyticsOverview;
}) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Analytics"
        description="Resumen consolidado del rendimiento de tu negocio y sus sucursales."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitas perfil"
          value={String(overview.summary.profileViews)}
        />
        <StatCard
          label="Favoritos"
          value={String(overview.summary.favoritesAdded)}
        />
        <StatCard
          label="Clicks contacto"
          value={String(overview.summary.contactClicks)}
        />
        <StatCard
          label="Reseñas generadas"
          value={String(overview.summary.reviewsGenerated)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChart
          title="Tráfico reciente"
          description="Serie de vistas al perfil en el periodo analizado."
          data={overview.trafficSeries}
        />

        <TrendChart
          title="Historial de score"
          description="Evolución del score empresarial consolidado."
          data={overview.scoreHistory}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FunnelChart steps={overview.funnel} />
        <SourceBreakdownTable items={overview.sourceBreakdown} />
      </div>

      <SectionCard
        title="Ranking de sucursales"
        description="Comparativa de desempeño entre sedes."
      >
        <BranchRankingTable items={overview.branchRanking} />
      </SectionCard>
    </div>
  );
}