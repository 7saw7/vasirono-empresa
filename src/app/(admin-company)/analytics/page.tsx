import { getCompanyContext } from "@/lib/auth/company-context";
import { getAnalyticsOverviewQuery } from "@/lib/db/queries/admin-company/analytics";
import AnalyticsView from "./_components/AnalyticsView";

export default async function AnalyticsPage() {
  const { companyId } = await getCompanyContext("viewAnalytics");
  const overview = await getAnalyticsOverviewQuery(companyId);

  return <AnalyticsView overview={overview} />;
}