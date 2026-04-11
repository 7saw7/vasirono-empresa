import { getCompanyContext } from "@/lib/auth/company-context";
import { getDashboardQuery } from "@/lib/db/queries/admin-company/dashboard";
import { DashboardView } from "./_components/DashboardView";

export default async function DashboardPage() {
  const { companyId } = await getCompanyContext("viewDashboard");
  const data = await getDashboardQuery(companyId);

  return <DashboardView data={data} />;
}