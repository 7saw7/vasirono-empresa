import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CompanyContactItem } from "@/features/admin-company/company/types";

export function CompanyContactsForm({
  items,
}: {
  items: CompanyContactItem[];
}) {
  return (
    <SectionCard
      title="Contactos corporativos"
      description="Canales visibles del negocio."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-neutral-950">
                {item.typeLabel}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{item.value}</p>
            </div>

            <div className="flex flex-wrap gap-2">
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