import Link from "next/link";
import type { DashboardBranchPerformanceItem } from "@/features/admin-company/dashboard/types";
import { formatNumber } from "@/lib/utils/numbers";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function BranchPerformanceTable({
  items,
}: {
  items: DashboardBranchPerformanceItem[];
}) {
  const columns: DataTableColumn<DashboardBranchPerformanceItem>[] = [
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
      key: "main",
      header: "Tipo",
      render: (row) =>
        row.isMain ? (
          <StatusBadge label="Principal" tone="info" />
        ) : (
          <StatusBadge label="Secundaria" tone="default" />
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
      render: (row) => formatNumber(row.visits30d),
    },
    {
      key: "reviews",
      header: "Reseñas 90d",
      render: (row) => formatNumber(row.reviews90d),
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => row.avgRating90d.toFixed(1),
    },
  ];

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aún no hay sucursales con métricas para mostrar.
      </p>
    );
  }

  return (
    <DataTable<DashboardBranchPerformanceItem>
      columns={columns}
      data={items}
      getRowKey={(row) => String(row.branchId)}
    />
  );
}