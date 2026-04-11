import { SectionCard } from "@/components/ui/SectionCard";
import type { FunnelStep } from "@/features/admin-company/analytics/types";

export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((step) => step.value), 1);

  return (
    <SectionCard
      title="Funnel de conversión"
      description="Caída progresiva desde descubrimiento hasta intención."
    >
      {steps.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay datos del funnel disponibles.
        </p>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => {
            const percentage = Math.round((step.value / max) * 100);

            return (
              <div
                key={step.key}
                className="rounded-2xl border border-neutral-200 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Paso {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-neutral-950">
                      {step.label}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-neutral-950">
                      {step.value}
                    </p>
                    <p className="text-xs text-neutral-500">{percentage}%</p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${Math.max(4, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}