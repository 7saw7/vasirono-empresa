import Link from "next/link";
import type { BranchListItem } from "@/features/admin-company/branches/types";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNumber } from "@/lib/utils/numbers";

function metricText(value: number | null | undefined, decimals = 0) {
  if (value === null || value === undefined) return "Sin datos";
  return decimals > 0 ? value.toFixed(decimals) : formatNumber(value);
}

export function BranchCard({ branch }: { branch: BranchListItem }) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              {branch.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{branch.address}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{branch.districtName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {branch.isMain ? (
              <StatusBadge label="Principal" tone="info" />
            ) : (
              <StatusBadge label="Secundaria" tone="default" />
            )}

            {branch.isActive ? (
              <StatusBadge label="Activa" tone="success" />
            ) : (
              <StatusBadge label="Inactiva" tone="danger" />
            )}
          </div>
        </div>

        {branch.description ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{branch.description}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Score
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">
              {metricText(branch.finalScore, 1)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Visitas 30d
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">
              {metricText(branch.visits30d)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rating 90d
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">
              {metricText(branch.avgRating90d, 1)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/sucursales/${branch.branchId}`}
            className="text-sm font-medium text-slate-950 dark:text-slate-100 hover:underline"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}