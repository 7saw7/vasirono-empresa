import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { DashboardActivityItem } from "@/features/admin-company/dashboard/types";

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
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-neutral-200 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-950">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {item.description}
                </p>
              </div>

              <span className="text-xs text-neutral-400">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}