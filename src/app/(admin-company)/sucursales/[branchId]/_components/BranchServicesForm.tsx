import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchServiceItem } from "@/features/admin-company/branches/types";

export function BranchServicesForm({
  items,
}: {
  items: BranchServiceItem[];
}) {
  return (
    <SectionCard title="Servicios" description="Servicios habilitados por sede.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.serviceId}
            className="rounded-2xl border border-neutral-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  {item.name}
                </p>
                <p className="text-xs text-neutral-500">{item.code}</p>
              </div>
              {item.isAvailable ? (
                <StatusBadge label="Disponible" tone="success" />
              ) : (
                <StatusBadge label="No disponible" tone="danger" />
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}