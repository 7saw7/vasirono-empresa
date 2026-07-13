import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchContactItem } from "@/features/admin-company/branches/types";

export function BranchContactsForm({
  contacts,
}: {
  contacts: BranchContactItem[];
}) {
  return (
    <SectionCard
      title="Contactos de la sucursal"
      description="Canales de contacto asociados a esta sede."
    >
      {contacts.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Esta sucursal aún no tiene contactos registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.contactId}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {contact.typeLabel}
                </h3>

                {contact.isPrimary ? (
                  <StatusBadge label="Principal" tone="info" />
                ) : null}

                {contact.isPublic ? (
                  <StatusBadge label="Público" tone="success" />
                ) : (
                  <StatusBadge label="Interno" tone="default" />
                )}
              </div>

              {contact.label ? (
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {contact.label}
                </p>
              ) : null}

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{contact.value}</p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}