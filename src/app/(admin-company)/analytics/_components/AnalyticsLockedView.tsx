import Link from "next/link";
import { BarChart3, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import type { CurrentPlan } from "@/features/admin-company/billing/types";

export default function AnalyticsLockedView({
  currentPlan,
}: {
  currentPlan: CurrentPlan;
}) {
  const upgradeTarget = currentPlan.upgradeTargets.find(
    (target) => target.features.analyticsAdvanced,
  );
  const currentPlanLabel = currentPlan.planName?.trim() || currentPlan.plan.toUpperCase();

  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Analytics"
        description="Resumen consolidado del rendimiento de tu negocio y sus sucursales."
      />

      <SectionCard className="overflow-hidden p-0 sm:p-0">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-400">
              Función protegida por plan
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Analytics avanzado no está incluido en {currentPlanLabel}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Actualiza tu plan para acceder a métricas avanzadas, comparar el rendimiento de
              tus sucursales y analizar cómo los usuarios descubren tu negocio.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {upgradeTarget ? (
                <Button asChild size="lg">
                  <Link href="/plan">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ver plan {upgradeTarget.label}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/plan">Revisar mi plan</Link>
                </Button>
              )}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Estado: {currentPlan.statusLabel || currentPlan.status}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/35 lg:border-l lg:border-t-0 sm:p-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-bold text-slate-950 dark:text-white">Incluye</h3>
            </div>
            <ul className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              {[
                "Tráfico y evolución del score",
                "Funnel de conversión",
                "Ranking comparativo de sucursales",
                "Desglose de resultados por fuente",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
