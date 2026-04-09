import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchScheduleItem } from "@/features/admin-company/branches/types";

export function BranchSchedulesForm({
  items,
}: {
  items: BranchScheduleItem[];
}) {
  return (
    <SectionCard
      title="Horarios"
      description="Bloques horarios configurados para la sucursal."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.scheduleId}
            className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-neutral-950">
                {item.dayName}
              </p>
              <p className="text-xs text-neutral-500">
                Turno {item.shiftNumber}
              </p>
            </div>
            <p className="text-sm text-neutral-700">
              {item.opening ?? "—"} - {item.closing ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}