import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchScheduleItem } from "@/features/admin-company/branches/types";

export function BranchSchedulesForm({
  schedules,
}: {
  schedules: BranchScheduleItem[];
}) {
  return (
    <SectionCard
      title="Horarios"
      description="Turnos y horarios configurados para la sucursal."
    >
      {schedules.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay horarios registrados para esta sucursal.
        </p>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  {schedule.dayName}
                </p>
                <p className="text-xs text-neutral-500">
                  Turno {schedule.shiftNumber}
                </p>
              </div>

              <p className="text-sm text-neutral-700">
                {schedule.opening && schedule.closing
                  ? `${schedule.opening} - ${schedule.closing}`
                  : "No definido"}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}