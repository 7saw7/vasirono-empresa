import { CheckCircle2, ClipboardCheck, ShieldCheck, TimerReset } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  DashboardServiceStatus,
  DashboardVerificationSummary,
} from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

export function VerificationSummaryCard({
  summary,
  serviceStatus,
}: {
  summary: DashboardVerificationSummary | null;
  serviceStatus: DashboardServiceStatus;
}) {
  if (!summary) {
    return (
      <SectionCard title="Verificación empresarial" description="Estado actual de la validación del negocio.">
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center dark:border-slate-700 dark:bg-slate-900/35">
          <div>
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {serviceStatus === "unavailable"
                ? "Servicio de verificación no disponible"
                : "Sin verificación iniciada"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {serviceStatus === "unavailable"
                ? "El resto del dashboard está disponible. Vuelve a actualizar en unos momentos."
                : "El estado aparecerá cuando se inicie una validación empresarial."}
            </p>
          </div>
        </div>
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
    <SectionCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
            Verificación empresarial
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Estado de confianza del negocio.
          </p>
        </div>
        <StatusBadge label={summary.statusLabel} tone={summary.statusTone} />
      </div>

      <div className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-4 dark:border-sky-900/60 dark:from-sky-950/40 dark:to-blue-950/25">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm dark:bg-slate-900 dark:text-sky-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nivel actual</p>
              <p className="mt-0.5 text-base font-bold text-slate-950 dark:text-white">{summary.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold leading-none text-slate-950 dark:text-white">{summary.score}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Score</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/55">
          <ClipboardCheck className="h-4 w-4 text-blue-500" aria-hidden="true" />
          <p className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
            {summary.checksCompleted}/{summary.checksTotal}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Controles completados</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/55">
          <TimerReset className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <p className="mt-3 truncate text-sm font-bold text-slate-950 dark:text-white">
            {summary.lastReviewAt ? formatDateTime(summary.lastReviewAt) : "Pendiente"}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Última revisión</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Progreso de validación
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
