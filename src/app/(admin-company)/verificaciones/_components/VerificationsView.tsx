import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import type { CompanyVerificationData } from "@/features/admin-company/verifications/types";
import { VerificationAddressMatches } from "./VerificationAddressMatches";
import { VerificationChecksTable } from "./VerificationChecksTable";
import { VerificationContactsTable } from "./VerificationContactsTable";
import { VerificationDocumentsTable } from "./VerificationDocumentsTable";
import { VerificationStatusCard } from "./VerificationStatusCard";
import { VerificationTimeline } from "./VerificationTimeline";

export function VerificationsView({
  data,
}: {
  data: CompanyVerificationData;
}) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Verificaciones"
        description="Monitorea el estado de validación y evidencia del negocio."
      />

      <VerificationStatusCard summary={data.summary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationChecksTable items={data.checks} />
        <VerificationDocumentsTable items={data.documents} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationContactsTable items={data.contacts} />
        <VerificationAddressMatches items={data.addressMatches} />
      </div>

      <VerificationTimeline items={data.timeline} />
    </div>
  );
}