import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { DashboardVerificationSummary } from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

export function VerificationSummaryCard({
  summary,
}: {
  summary: DashboardVerificationSummary | null;
}) {
  if (!summary) {
    return (
      <SectionCard title="Verificación">
        <p className="text-sm text-neutral-500">
          No hay datos de verificación disponibles.
        </p>
      </SectionCard>
    );
  }

  const progress =
    summary.checksTotal > 0
      ? Math.min(
          100,
          Math.round((summary.checksCompleted / summary.checksTotal) * 100)
        )
      : 0;

  return (
    <SectionCard
      title="Verificación empresarial"
      description="Estado actual del flujo de validación del negocio."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={summary.statusLabel} tone={summary.statusTone} />
          <span className="text-sm text-neutral-500">
            Nivel: <strong className="text-neutral-900">{summary.level}</strong>
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Score
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">
              {summary.score}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Checks completados
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">
              {summary.checksCompleted}/{summary.checksTotal}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Última revisión
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              {summary.lastReviewAt
                ? formatDateTime(summary.lastReviewAt)
                : "—"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}