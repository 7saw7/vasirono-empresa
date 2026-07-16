import { getCompanyContext } from "@/lib/auth/company-context";
import { hasPermission } from "@/lib/constants/permissions";
import { getCompanyVerificationsQuery } from "@/lib/db/queries/admin-company/verifications";
import { VerificationsView } from "./_components/VerificationsView";

export default async function VerificationsPage() {
  const { companyId, role } = await getCompanyContext("viewVerifications");
  const data = await getCompanyVerificationsQuery(companyId);

  return (
    <VerificationsView
      data={data}
      canRequestVerification={hasPermission(role, "requestVerification")}
      canSubmitVerification={hasPermission(role, "submitVerification")}
    />
  );
}
