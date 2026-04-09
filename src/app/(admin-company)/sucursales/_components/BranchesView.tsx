import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { BranchCard } from "./BranchCard";
import { BranchFilters } from "./BranchFilters";
import { BranchForm } from "./BranchForm";
import type { BranchListItem } from "@/features/admin-company/branches/types";

export function BranchesView({
  branches,
}: {
  branches: BranchListItem[];
}) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Sucursales"
        description="Administra las sedes visibles de tu negocio."
      />

      <BranchFilters />

      <SectionCard
        title="Nueva sucursal"
        description="Registra una nueva sede dentro de tu empresa."
      >
        <BranchForm />
      </SectionCard>

      <div className="grid gap-4">
        {branches.map((branch) => (
          <BranchCard key={branch.branchId} branch={branch} />
        ))}
      </div>
    </div>
  );
}