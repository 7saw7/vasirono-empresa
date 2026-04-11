import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanyVerificationsQuery } from "@/lib/db/queries/admin-company/verifications";
import { VerificationsView } from "./_components/VerificationsView";

export default async function VerificationsPage() {
  const { companyId } = await getCompanyContext("viewVerifications");
  const data = await getCompanyVerificationsQuery(companyId);

  return <VerificationsView data={data} />;
}