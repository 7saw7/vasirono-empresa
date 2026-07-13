import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CompanyContactItem } from "@/features/admin-company/company/types";

export function CompanyContactsForm({
  contacts,
}: {
  contacts: CompanyContactItem[];
}) {
  return (
    <SectionCard
      title="Canales del perfil"
      description="Datos públicos que provienen directamente del perfil principal."
    >
      {contacts.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay canales públicos configurados.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {contact.typeLabel}
                </h3>
                <StatusBadge label="Perfil público" tone="success" />
              </div>

              <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">
                {contact.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
