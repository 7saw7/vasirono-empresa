import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchDetail } from "@/features/admin-company/branches/types";

export function BranchAnalyticsSummary({
  branch,
}: {
  branch: BranchDetail;
}) {
  return (
    <SectionCard
      title="Resumen analítico"
      description="Métricas rápidas de rendimiento de la sucursal."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Score
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {branch.finalScore?.toFixed(1) ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Visitas 30d
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {branch.visits30d ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Rating 90d
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {branch.avgRating90d?.toFixed(1) ?? "—"}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}