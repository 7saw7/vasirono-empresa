import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SectionCard } from "@/components/ui/SectionCard";
import type { VerificationDocumentItem } from "@/features/admin-company/verifications/types";
import { formatDateTime } from "@/lib/utils/dates";

export function VerificationDocumentsTable({
  items,
}: {
  items: VerificationDocumentItem[];
}) {
  const columns: DataTableColumn<VerificationDocumentItem>[] = [
    {
      key: "type",
      header: "Tipo",
      render: (row) => row.typeLabel,
    },
    {
      key: "file",
      header: "Archivo",
      render: (row) => (
        <Link
          href={row.fileUrl}
          target="_blank"
          className="font-medium text-slate-950 dark:text-slate-100 hover:underline"
        >
          {row.fileName}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => row.statusLabel,
    },
    {
      key: "uploadedAt",
      header: "Subido",
      render: (row) => (row.uploadedAt ? formatDateTime(row.uploadedAt) : "—"),
    },
  ];

  return (
    <SectionCard
      title="Documentos"
      description="Archivos de soporte cargados para la verificación."
    >
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay documentos registrados.
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