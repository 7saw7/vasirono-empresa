import Link from "next/link";
import { BadgeCheck, Crown, Sparkles } from "lucide-react";
import type { PlanCode } from "@/features/admin-company/billing/types";
import { cn } from "@/lib/utils/cn";

export type AdminCompanyPlanBadgeData = {
  plan: PlanCode;
  planName: string | null;
  isActive: boolean;
  statusLabel: string;
};

type AdminCompanyPlanBadgeProps = {
  currentPlan: AdminCompanyPlanBadgeData | null;
  compact?: boolean;
  className?: string;
};

const PLAN_PRESENTATION: Record<
  PlanCode,
  {
    label: string;
    icon: typeof BadgeCheck;
    className: string;
  }
> = {
  free: {
    label: "Free",
    icon: BadgeCheck,
    className:
      "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-200/80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700",
  },
  pro: {
    label: "Pro",
    icon: Sparkles,
    className:
      "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/55 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-sky-900/60",
  },
  premium: {
    label: "Premium",
    icon: Crown,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-900/55",
  },
};

export function AdminCompanyPlanBadge({
  currentPlan,
  compact = false,
  className,
}: AdminCompanyPlanBadgeProps) {
  if (!currentPlan) {
    return (
      <span
        title="No se pudo consultar el plan actual."
        aria-label="Plan actual no disponible"
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border border-dashed border-slate-300 bg-white/70 font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-500",
          compact ? "h-6 px-2 text-[9px]" : "h-7 px-2.5 text-[10px]",
          className,
        )}
      >
        Plan —
      </span>
    );
  }

  const presentation = PLAN_PRESENTATION[currentPlan.plan];
  const Icon = presentation.icon;
  const planName = currentPlan.planName?.trim() || presentation.label;
  const statusText = currentPlan.isActive
    ? "activo"
    : currentPlan.statusLabel?.trim() || "inactivo";

  return (
    <Link
      href="/plan"
      title={`Plan actual: ${planName} (${statusText}). Ver plan y beneficios.`}
      aria-label={`Plan actual: ${planName}. Ver plan y beneficios.`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-bold uppercase tracking-[0.08em] outline-none transition focus-visible:ring-2 focus-visible:ring-sky-500/40",
        compact ? "h-6 gap-1 px-2 text-[9px]" : "h-7 gap-1.5 px-2.5 text-[10px]",
        presentation.className,
        !currentPlan.isActive && "opacity-70 grayscale-[0.2]",
        className,
      )}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      <span>{presentation.label}</span>
    </Link>
  );
}
