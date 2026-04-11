import Link from "next/link";
import type { BranchListItem } from "@/features/admin-company/branches/types";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNumber } from "@/lib/utils/numbers";

export function BranchCard({ branch }: { branch: BranchListItem }) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-950">
              {branch.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{branch.address}</p>
            <p className="mt-1 text-sm text-neutral-500">{branch.districtName}</p>
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
          <p className="text-sm text-neutral-600">{branch.description}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Score
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {(branch.finalScore ?? 0).toFixed(1)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Visitas 30d
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {formatNumber(branch.visits30d ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Rating 90d
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {(branch.avgRating90d ?? 0).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/sucursales/${branch.branchId}`}
            className="text-sm font-medium text-neutral-950 hover:underline"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}