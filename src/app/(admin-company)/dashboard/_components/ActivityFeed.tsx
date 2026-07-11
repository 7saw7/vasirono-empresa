import {
  BarChart3,
  Building2,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Store,
} from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import type { DashboardActivityItem } from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

const TYPE_META: Record<
  DashboardActivityItem["type"],
  { label: string; icon: typeof MessageSquare; classes: string }
> = {
  review: {
    label: "Reseña",
    icon: MessageSquare,
    classes: "bg-violet-50 text-violet-600 dark:bg-violet-950/45 dark:text-violet-400",
  },
  verification: {
    label: "Verificación",
    icon: ShieldCheck,
    classes: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400",
  },
  branch: {
    label: "Sucursal",
    icon: Store,
    classes: "bg-sky-50 text-sky-600 dark:bg-sky-950/45 dark:text-sky-400",
  },
  analytics: {
    label: "Analytics",
    icon: BarChart3,
    classes: "bg-blue-50 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400",
  },
  company: {
    label: "Empresa",
    icon: Building2,
    classes: "bg-amber-50 text-amber-600 dark:bg-amber-950/45 dark:text-amber-400",
  },
  system: {
    label: "Sistema",
    icon: Settings2,
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

export function ActivityFeed({
  items,
}: {
  items: DashboardActivityItem[];
}) {
  return (
    <SectionCard
      title="Actividad reciente"
      description="Últimos eventos relevantes del panel."
      className="h-full"
    >
      {items.length === 0 ? (
        <div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/35">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aún no hay actividad reciente para mostrar.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item, index) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;

            return (
              <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                {index < items.length - 1 ? (
                  <span className="absolute left-4 top-9 h-[calc(100%-26px)] w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                ) : null}

                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.classes}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
