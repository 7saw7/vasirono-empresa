import { getCompanyContext } from "@/lib/auth/company-context";
import { getAnalyticsOverviewQuery } from "@/lib/db/queries/admin-company/analytics";
import { getCurrentPlanQuery } from "@/lib/db/queries/admin-company/billing";
import AnalyticsLockedView from "./_components/AnalyticsLockedView";
import AnalyticsView from "./_components/AnalyticsView";

export default async function AnalyticsPage() {
  const { companyId } = await getCompanyContext("viewAnalytics");
  const currentPlan = await getCurrentPlanQuery(companyId);
  const hasAdvancedAnalytics =
    currentPlan.isActive && currentPlan.features.analyticsAdvanced;

  if (!hasAdvancedAnalytics) {
    return <AnalyticsLockedView currentPlan={currentPlan} />;
  }

  const overview = await getAnalyticsOverviewQuery(companyId);

  return <AnalyticsView overview={overview} />;
}
