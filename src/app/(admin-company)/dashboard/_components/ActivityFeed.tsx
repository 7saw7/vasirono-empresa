import { SectionCard } from "@/components/ui/SectionCard";
import type { DashboardActivityItem } from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

const TYPE_LABELS: Record<DashboardActivityItem["type"], string> = {
  review: "Reseña",
  verification: "Verificación",
  branch: "Sucursal",
  analytics: "Analytics",
  company: "Empresa",
  system: "Sistema",
};

export function ActivityFeed({
  items,
}: {
  items: DashboardActivityItem[];
}) {
  return (
    <SectionCard
      title="Actividad reciente"
      description="Últimos eventos relevantes del panel empresarial."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no hay actividad reciente para mostrar.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                      {TYPE_LABELS[item.type]}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-950">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    {item.description}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-neutral-400">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}