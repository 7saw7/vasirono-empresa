import { getCompanyContext } from "@/lib/auth/company-context";
import { hasPermission } from "@/lib/constants/permissions";
import { getCompanyBillingQuery } from "@/lib/db/queries/admin-company/billing";
import { BillingView } from "./_components/BillingView";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { companyId, role } = await getCompanyContext("manageBilling");
  const data = await getCompanyBillingQuery(companyId);

  return (
    <BillingView
      data={data}
      canChangePlan={hasPermission(role, "changeBillingPlan")}
    />
  );
}
