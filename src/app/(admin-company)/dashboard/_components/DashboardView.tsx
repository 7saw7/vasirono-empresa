import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import type { DashboardData } from "@/features/admin-company/dashboard/types";
import { ActivityFeed } from "./ActivityFeed";
import { BranchPerformanceTable } from "./BranchPerformanceTable";
import { CompanyScoreCard } from "./CompanyScoreCard";
import { KpiCard } from "./KpiCard";
import { VerificationSummaryCard } from "./VerificationSummaryCard";

export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title={`Hola, ${data.companyName}`}
        description="Resumen ejecutivo del estado actual de tu empresa dentro de Vasirono."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((item) => (
          <KpiCard key={item.id} item={item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CompanyScoreCard score={data.companyScore} />
        <VerificationSummaryCard summary={data.verificationSummary} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Rendimiento por sucursal"
          description="Comparativa rápida de desempeño reciente."
        >
          <BranchPerformanceTable items={data.branchPerformance} />
        </SectionCard>

        <ActivityFeed items={data.recentActivity} />
      </div>
    </div>
  );
}