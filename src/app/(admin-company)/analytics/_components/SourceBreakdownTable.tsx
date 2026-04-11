import { SectionCard } from "@/components/ui/SectionCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import type { SourceBreakdownItem } from "@/features/admin-company/analytics/types";

export function SourceBreakdownTable({
  items,
}: {
  items: SourceBreakdownItem[];
}) {
  const columns: DataTableColumn<SourceBreakdownItem>[] = [
    {
      key: "source",
      header: "Fuente",
      render: (row) => row.source,
    },
    {
      key: "visits",
      header: "Visitas",
      render: (row) => String(row.visitsCount),
    },
    {
      key: "favorites",
      header: "Favoritos",
      render: (row) => String(row.favoritesCount),
    },
    {
      key: "contacts",
      header: "Contactos",
      render: (row) => String(row.contactClicks),
    },
    {
      key: "reviews",
      header: "Reseñas",
      render: (row) => String(row.reviewsCount),
    },
  ];

  return (
    <SectionCard
      title="Desglose por fuente"
      description="Origen del tráfico y señales de interacción."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay fuentes registradas para este periodo.
        </p>
      ) : (
        <DataTable<SourceBreakdownItem>
          columns={columns}
          data={items}
          getRowKey={(row) => row.source}
        />
      )}
    </SectionCard>
  );
}