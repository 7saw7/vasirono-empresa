import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchDetail } from "@/features/admin-company/branches/types";
import { BranchAnalyticsSummary } from "./BranchAnalyticsSummary";
import { BranchContactsForm } from "./BranchContactsForm";
import { BranchMediaManager } from "./BranchMediaManager";
import { BranchProfileForm } from "./BranchProfileForm";
import { BranchReviewsPreview } from "./BranchReviewsPreview";
import { BranchSchedulesForm } from "./BranchSchedulesForm";
import { BranchServicesForm } from "./BranchServicesForm";

export function BranchDetailView({ branch }: { branch: BranchDetail }) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title={branch.name}
        description="Gestiona la información operativa y visible de esta sucursal."
      />

      <BranchAnalyticsSummary branch={branch} />
      <BranchProfileForm branch={branch} />

      <div className="grid gap-6 xl:grid-cols-2">
        <BranchContactsForm contacts={branch.contacts} />
        <BranchSchedulesForm schedules={branch.schedules} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BranchServicesForm services={branch.services} />
        <BranchReviewsPreview branch={branch} />
      </div>

      <BranchMediaManager media={branch.media} />

      <SectionCard
        title="Ubicación"
        description="Referencia geográfica actual de la sucursal."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Latitud
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              {branch.lat ?? "No disponible"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Longitud
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              {branch.lon ?? "No disponible"}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}