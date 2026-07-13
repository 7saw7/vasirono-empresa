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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay comparaciones de dirección registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.sourceLabel}-${index}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {item.sourceLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
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