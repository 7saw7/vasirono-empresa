import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchDetail } from "@/features/admin-company/branches/types";
import { formatNumber } from "@/lib/utils/numbers";

export function BranchAnalyticsSummary({
  branch,
}: {
  branch: BranchDetail;
}) {
  return (
    <SectionCard
      title="Resumen de rendimiento"
      description="Indicadores rápidos de desempeño reciente de la sucursal."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {branch.isMain ? (
          <StatusBadge label="Sucursal principal" tone="info" />
        ) : (
          <StatusBadge label="Sucursal secundaria" tone="default" />
        )}

        {branch.isActive ? (
          <StatusBadge label="Activa" tone="success" />
        ) : (
          <StatusBadge label="Inactiva" tone="danger" />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Score
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {(branch.finalScore ?? 0).toFixed(1)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Visitas 30d
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {formatNumber(branch.visits30d ?? 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Rating 90d
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {(branch.avgRating90d ?? 0).toFixed(1)}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}