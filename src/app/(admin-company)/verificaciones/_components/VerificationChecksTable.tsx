import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationCheckItem } from "@/features/admin-company/verifications/types";
import { formatDateTime } from "@/lib/utils/dates";

export function VerificationChecksTable({
  items,
}: {
  items: VerificationCheckItem[];
}) {
  const columns: DataTableColumn<VerificationCheckItem>[] = [
    {
      key: "label",
      header: "Check",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-950 dark:text-slate-100">{row.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.code}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <StatusBadge label={row.statusLabel} tone={row.statusTone} />
      ),
    },
    {
      key: "notes",
      header: "Notas",
      render: (row) => row.notes || "—",
    },
    {
      key: "reviewedAt",
      header: "Revisado",
      render: (row) => (row.reviewedAt ? formatDateTime(row.reviewedAt) : "—"),
    },
  ];

  return (
    <SectionCard
      title="Checks de verificación"
      description="Estado detallado de cada punto validado."
    >
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay checks registrados.
        </p>
      ) : (
        <DataTable<VerificationCheckItem>
          columns={columns}
          data={items}
          getRowKey={(row) => String(row.id)}
        />
      )}
    </SectionCard>
  );
}