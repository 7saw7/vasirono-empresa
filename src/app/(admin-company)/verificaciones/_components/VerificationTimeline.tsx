import { SectionCard } from "@/components/ui/SectionCard";
import type { VerificationTimelineItem } from "@/features/admin-company/verifications/types";
import { formatDateTime } from "@/lib/utils/dates";

export function VerificationTimeline({
  items,
}: {
  items: VerificationTimelineItem[];
}) {
  return (
    <SectionCard
      title="Timeline de verificación"
      description="Historial reciente del proceso de validación."
    >
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay eventos de timeline registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {item.type}
                  </p>
                </div>

                <span className="text-xs text-slate-400 dark:text-slate-500">
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