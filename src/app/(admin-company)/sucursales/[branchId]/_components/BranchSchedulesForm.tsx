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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay horarios registrados para esta sucursal.
        </p>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {schedule.dayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Turno {schedule.shiftNumber}
                </p>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">
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