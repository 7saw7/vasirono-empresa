import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationAddressMatchItem } from "@/features/admin-company/verifications/types";

export function VerificationAddressMatches({
  items,
}: {
  items: VerificationAddressMatchItem[];
}) {
  return (
    <SectionCard
      title="Coincidencia de direcciones"
      description="Comparación entre direcciones detectadas y la dirección del negocio."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay comparaciones de dirección registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.sourceLabel}-${index}`}
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {item.sourceLabel}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {item.addressValue}
                  </p>
                </div>

                {item.matchesCompany ? (
                  <StatusBadge label="Coincide" tone="success" />
                ) : (
                  <StatusBadge label="No coincide" tone="warning" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}