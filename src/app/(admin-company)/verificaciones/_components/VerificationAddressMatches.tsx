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
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {item.sourceLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {item.addressValue || "Dirección no disponible"}
                  </p>
                  {item.notes ? (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusBadge
                    label={item.matchesCompany ? "Coincide" : "No coincide"}
                    tone={item.matchesCompany ? "success" : "warning"}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Confianza: {Math.max(0, Math.min(100, item.confidenceScore))}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
