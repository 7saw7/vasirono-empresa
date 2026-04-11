import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import type { BranchRankingItem } from "@/features/admin-company/analytics/types";

export function BranchRankingTable({
  items,
}: {
  items: BranchRankingItem[];
}) {
  const columns: DataTableColumn<BranchRankingItem>[] = [
    {
      key: "branch",
      header: "Sucursal",
      render: (row) => (
        <div className="space-y-1">
          <Link
            href={`/sucursales/${row.branchId}`}
            className="font-medium text-neutral-950 hover:underline"
          >
            {row.branchName}
          </Link>
          <p className="text-xs text-neutral-500">{row.districtName}</p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (row) => row.finalScore.toFixed(1),
    },
    {
      key: "visits",
      header: "Visitas 30d",
      render: (row) => String(row.visits30d),
    },
    {
      key: "favorites",
      header: "Favoritos 30d",
      render: (row) => String(row.favorites30d),
    },
    {
      key: "contacts",
      header: "Contactos 30d",
      render: (row) => String(row.contactClicks30d),
    },
  ];

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No hay sucursales con métricas disponibles.
      </p>
    );
  }

  return (
    <DataTable<BranchRankingItem>
      columns={columns}
      data={items}
      getRowKey={(row) => String(row.branchId)}
    />
  );
}