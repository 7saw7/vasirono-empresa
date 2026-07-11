import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
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
            className="group inline-flex items-center gap-1 font-semibold text-slate-950 hover:text-sky-600 dark:text-slate-100 dark:hover:text-sky-400"
          >
            <span>{row.branchName}</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.districtName}</p>
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
      render: (row) => (
        <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {row.finalScore.toFixed(1)}
        </span>
      ),
    },
    {
      key: "visits",
      header: "Visitas 30d",
      render: (row) => <span className="tabular-nums">{formatNumber(row.visits30d)}</span>,
    },
    {
      key: "reviews",
      header: "Reseñas 90d",
      render: (row) => <span className="tabular-nums">{formatNumber(row.reviews90d)}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          {row.avgRating90d.toFixed(1)}
        </span>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/35">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay sucursales con métricas para mostrar.
        </p>
      </div>
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
