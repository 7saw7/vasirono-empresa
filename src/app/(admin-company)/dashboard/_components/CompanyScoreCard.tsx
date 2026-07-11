import { Activity, ArrowUpRight } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import type { DashboardCompanyScore } from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function CompanyScoreCard({
  score,
}: {
  score: DashboardCompanyScore | null;
}) {
  if (!score) {
    return (
      <SectionCard title="Rendimiento empresarial" description="Indicadores consolidados de calidad y alcance.">
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center dark:border-slate-700 dark:bg-slate-900/35">
          <div>
            <Activity className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Aún no hay score disponible
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Los indicadores aparecerán cuando Analytics complete el primer cálculo.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  const finalScore = clampScore(score.finalScore);
  const items = [
    { label: "Popularidad", value: score.popularityScore },
    { label: "Engagement", value: score.engagementScore },
    { label: "Conversión", value: score.conversionScore },
    { label: "Confianza", value: score.trustScore },
    { label: "Actualización", value: score.freshnessScore },
  ];

  return (
    <SectionCard className="overflow-hidden">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
            <h2 className="text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
              Rendimiento empresarial
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Distribución del score consolidado por dimensión.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          Score actual
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(rgb(14 165 233) ${finalScore}%, rgba(148, 163, 184, 0.18) ${finalScore}% 100%)`,
            }}
          >
            <div className="flex h-[126px] w-[126px] flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-[#121a23]">
              <span className="text-[34px] font-bold leading-none tracking-tight text-slate-950 dark:text-white">
                {score.finalScore.toFixed(1)}
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Score final
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const progress = clampScore(item.value);

            return (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {item.value.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        Último cálculo: {formatDateTime(score.calculatedAt)}
      </div>
    </SectionCard>
  );
}
