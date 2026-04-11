import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanyProfileQuery } from "@/lib/db/queries/admin-company/company";
import { CompanyProfileView } from "./_components/CompanyProfileView";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const { companyId } = await getCompanyContext("manageCompany");
  const data = await getCompanyProfileQuery(companyId);

  return <CompanyProfileView data={data} />;
}