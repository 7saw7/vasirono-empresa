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
      title="Contactos públicos"
      description="Canales visibles y configurados para el negocio."
    >
      {contacts.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no hay contactos registrados para este negocio.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-950">
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

              <p className="mt-2 text-sm text-neutral-600">{contact.value}</p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}