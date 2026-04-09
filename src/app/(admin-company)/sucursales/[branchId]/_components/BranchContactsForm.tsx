import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchContactItem } from "@/features/admin-company/branches/types";

export function BranchContactsForm({
  items,
}: {
  items: BranchContactItem[];
}) {
  return (
    <SectionCard
      title="Contactos"
      description="Canales operativos y públicos de la sucursal."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.contactId}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-neutral-950">
                {item.typeLabel}
              </p>
              <p className="text-sm text-neutral-500">{item.value}</p>
              {item.label ? (
                <p className="text-xs text-neutral-400">{item.label}</p>
              ) : null}
            </div>

            <div className="flex gap-2">
              {item.isPrimary ? (
                <StatusBadge label="Principal" tone="info" />
              ) : null}
              {item.isPublic ? (
                <StatusBadge label="Público" tone="success" />
              ) : (
                <StatusBadge label="Privado" />
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}