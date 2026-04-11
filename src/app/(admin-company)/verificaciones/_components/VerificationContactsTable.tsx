import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationContactItem } from "@/features/admin-company/verifications/types";

export function VerificationContactsTable({
  items,
}: {
  items: VerificationContactItem[];
}) {
  const columns: DataTableColumn<VerificationContactItem>[] = [
    {
      key: "type",
      header: "Tipo",
      render: (row) => row.contactType,
    },
    {
      key: "value",
      header: "Valor",
      render: (row) => row.value,
    },
    {
      key: "source",
      header: "Fuente",
      render: (row) => row.sourceLabel,
    },
    {
      key: "match",
      header: "Coincide",
      render: (row) =>
        row.matchesCompany ? (
          <StatusBadge label="Sí" tone="success" />
        ) : (
          <StatusBadge label="No" tone="warning" />
        ),
    },
  ];

  return (
    <SectionCard
      title="Contactos contrastados"
      description="Comparación entre fuentes y datos del negocio."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay contactos contrastados.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          getRowKey={(row) => String(row.id)}
        />
      )}
    </SectionCard>
  );
}