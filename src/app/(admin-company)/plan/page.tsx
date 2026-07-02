import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanyBillingQuery } from "@/lib/db/queries/admin-company/billing";
import { BillingView } from "./_components/BillingView";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { companyId } = await getCompanyContext("manageBilling");
  const data = await getCompanyBillingQuery(companyId);

  return <BillingView data={data} />;
}
