import { SectionCard } from "@/components/ui/SectionCard";
import type { DashboardCompanyScore } from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

export function CompanyScoreCard({
  score,
}: {
  score: DashboardCompanyScore | null;
}) {
  if (!score) {
    return (
      <SectionCard title="Score empresarial">
        <p className="text-sm text-neutral-500">
          Aún no hay score disponible para esta empresa.
        </p>
      </SectionCard>
    );
  }

  const items = [
    { label: "Final", value: score.finalScore },
    { label: "Popularidad", value: score.popularityScore },
    { label: "Engagement", value: score.engagementScore },
    { label: "Conversión", value: score.conversionScore },
    { label: "Confianza", value: score.trustScore },
    { label: "Actualización", value: score.freshnessScore },
  ];

  return (
    <SectionCard
      title="Score empresarial"
      description="Resumen consolidado de desempeño y calidad."
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {item.value.toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-400">
          Último cálculo: {formatDateTime(score.calculatedAt)}
        </p>
      </div>
    </SectionCard>
  );
}