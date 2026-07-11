import { Building2, CheckCircle2, RefreshCw, SlidersHorizontal } from "lucide-react";
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
    <div className="space-y-5 sm:space-y-6">
      <AdminCompanyHeader
        title="Dashboard"
        description={`Supervisa el rendimiento, la visibilidad y el estado operativo de ${data.companyName}.`}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-[#121a23] dark:shadow-none">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/45 dark:text-sky-400">
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Vista general
          </span>
          <span className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{data.companyName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          <span>Datos sincronizados</span>
          <RefreshCw className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </section>

      <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((item) => (
          <KpiCard key={item.id} item={item} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
        <CompanyScoreCard score={data.companyScore} />
        <VerificationSummaryCard summary={data.verificationSummary} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
        <SectionCard
          title="Rendimiento por sucursal"
          description="Comparativa rápida del desempeño reciente de cada ubicación."
          className="min-w-0"
        >
          <BranchPerformanceTable items={data.branchPerformance} />
        </SectionCard>

        <ActivityFeed items={data.recentActivity} />
      </section>
    </div>
  );
}
