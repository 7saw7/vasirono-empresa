import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchDetail } from "@/features/admin-company/branches/types";
import { BranchAnalyticsSummary } from "./BranchAnalyticsSummary";
import { BranchMediaManager } from "./BranchMediaManager";
import { BranchOperationsPanel } from "./BranchOperationsPanel";
import { BranchProfileForm } from "./BranchProfileForm";
import { BranchReviewsPreview } from "./BranchReviewsPreview";

export function BranchDetailView({ branch }: { branch: BranchDetail }) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title={branch.name}
        description="Gestiona la información operativa y visible de esta sucursal."
      />

      <BranchAnalyticsSummary branch={branch} />
      <BranchProfileForm branch={branch} />

      <BranchOperationsPanel
        branchId={branch.branchId}
        contacts={branch.contacts}
        schedules={branch.schedules}
        services={branch.services}
      />

      <BranchReviewsPreview branch={branch} />
      <BranchMediaManager branchId={branch.branchId} branchName={branch.name} />

      <SectionCard title="Ubicación" description="Referencia geográfica actual de la sucursal.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Latitud</p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-slate-100">{branch.lat ?? "No disponible"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Longitud</p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-slate-100">{branch.lon ?? "No disponible"}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
