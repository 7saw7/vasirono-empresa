import type {
  BranchDistrictOption,
  BranchListItem,
} from "@/features/admin-company/branches/types";
import { BranchFilters } from "./BranchFilters";
import { BranchCard } from "./BranchCard";

type BranchesViewProps = {
  items: BranchListItem[];
  districts: BranchDistrictOption[];
};

export function BranchesView({ items, districts }: BranchesViewProps) {
  return (
    <div className="space-y-6">
      <BranchFilters districts={districts} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <h2 className="text-base font-semibold text-neutral-950">
            No se encontraron sucursales
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Ajusta los filtros o registra una nueva sucursal.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <BranchCard key={item.branchId} branch={item} />
          ))}
        </div>
      )}
    </div>
  );
}