import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchServiceItem } from "@/features/admin-company/branches/types";

export function BranchServicesForm({
  services,
}: {
  services: BranchServiceItem[];
}) {
  return (
    <SectionCard
      title="Servicios de la sucursal"
      description="Servicios actualmente asociados a esta sede."
    >
      {services.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay servicios registrados para esta sucursal.
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.serviceId}
              className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {service.name}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {service.code}
                </p>
              </div>

              {service.isAvailable ? (
                <StatusBadge label="Disponible" tone="success" />
              ) : (
                <StatusBadge label="No disponible" tone="danger" />
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}