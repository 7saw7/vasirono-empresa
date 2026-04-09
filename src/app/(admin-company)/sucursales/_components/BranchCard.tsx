import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchListItem } from "@/features/admin-company/branches/types";

export function BranchCard({ branch }: { branch: BranchListItem }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-950">
              {branch.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{branch.address}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {branch.isMain ? <StatusBadge label="Principal" tone="info" /> : null}
            {branch.isActive ? (
              <StatusBadge label="Activa" tone="success" />
            ) : (
              <StatusBadge label="Inactiva" tone="danger" />
            )}
          </div>
        </div>

        <p className="text-sm text-neutral-600">{branch.description}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Score
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {branch.finalScore?.toFixed(1) ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Visitas 30d
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {branch.visits30d ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Rating 90d
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {branch.avgRating90d?.toFixed(1) ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href={`/sucursales/${branch.branchId}`}>
            <Button variant="secondary">Ver detalle</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}