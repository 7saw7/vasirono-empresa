import {
  BarChart3,
  Eye,
  Heart,
  MousePointerClick,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DashboardKpi } from "@/features/admin-company/dashboard/types";
import { cn } from "@/lib/utils/cn";

function resolveIcon(item: DashboardKpi) {
  const key = `${item.id} ${item.label}`.toLowerCase();

  if (key.includes("vista") || key.includes("view")) return Eye;
  if (key.includes("favorit") || key.includes("guard")) return Heart;
  if (key.includes("clic") || key.includes("contact")) return MousePointerClick;
  if (key.includes("reseña") || key.includes("review") || key.includes("rating")) return Star;
  return BarChart3;
}

export function KpiCard({ item }: { item: DashboardKpi }) {
  const Icon = resolveIcon(item);
  const trendDirection = item.trend?.direction ?? "neutral";
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#121a23] dark:shadow-none dark:hover:border-sky-900/80 dark:hover:bg-[#141e29]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-sky-950/45 dark:text-sky-400 dark:ring-sky-900/70">
          <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
        </div>

        {item.trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold",
              trendDirection === "up" &&
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/45 dark:text-emerald-400",
              trendDirection === "down" &&
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/45 dark:text-red-400",
              trendDirection === "neutral" &&
                "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {item.trend.value}
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Actual
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {item.label}
        </p>
        <p className="mt-2 text-[30px] font-bold leading-none tracking-tight text-slate-950 dark:text-white">
          {item.value}
        </p>
        {item.helper ? (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {item.helper}
          </p>
        ) : null}
      </div>
    </article>
  );
}
