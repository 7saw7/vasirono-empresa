import { getCompanyProfileQuery } from "@/lib/db/queries/admin-company/company";
import { CompanyProfileView } from "./_components/CompanyProfileView";

export default async function CompanyProfilePage() {
  const data = await getCompanyProfileQuery();

  return <CompanyProfileView data={data} />;
}