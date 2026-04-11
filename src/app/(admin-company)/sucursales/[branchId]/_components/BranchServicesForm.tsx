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
        <p className="text-sm text-neutral-500">
          No hay servicios registrados para esta sucursal.
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.serviceId}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  {service.name}
                </p>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
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