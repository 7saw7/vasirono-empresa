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
        <p className="text-sm text-neutral-500">
          No hay eventos de timeline registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
                    {item.type}
                  </p>
                </div>

                <span className="text-xs text-neutral-400">
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