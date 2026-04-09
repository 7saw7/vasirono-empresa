import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionCard } from "@/components/ui/SectionCard";
import { BranchProfileForm } from "./BranchProfileForm";
import { BranchSchedulesForm } from "./BranchSchedulesForm";
import { BranchServicesForm } from "./BranchServicesForm";
import { BranchContactsForm } from "./BranchContactsForm";
import { BranchMediaManager } from "./BranchMediaManager";
import { BranchAnalyticsSummary } from "./BranchAnalyticsSummary";
import { BranchReviewsPreview } from "./BranchReviewsPreview";
import type { BranchDetail } from "@/features/admin-company/branches/types";

export function BranchDetailView({ branch }: { branch: BranchDetail }) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title={branch.name}
        description={`${branch.districtName} · ${branch.address}`}
      />

      <SectionCard
        title="Estado de la sucursal"
        description="Resumen operacional rápido."
      >
        <div className="flex flex-wrap gap-3">
          {branch.isMain ? <StatusBadge label="Principal" tone="info" /> : null}
          {branch.isActive ? (
            <StatusBadge label="Activa" tone="success" />
          ) : (
            <StatusBadge label="Inactiva" tone="danger" />
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Perfil de sucursal"
        description="Actualiza los datos centrales de esta sede."
      >
        <BranchProfileForm branch={branch} />
      </SectionCard>

      <BranchAnalyticsSummary branch={branch} />
      <BranchSchedulesForm items={branch.schedules} />
      <BranchServicesForm items={branch.services} />
      <BranchContactsForm items={branch.contacts} />
      <BranchMediaManager items={branch.media} />
      <BranchReviewsPreview />
    </div>
  );
}