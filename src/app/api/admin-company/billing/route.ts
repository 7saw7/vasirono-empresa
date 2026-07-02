import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanyBillingQuery } from "@/lib/db/queries/admin-company/billing";
import { handleRoute } from "@/lib/http/handle-route";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBilling");
    return getCompanyBillingQuery(companyId);
  });
}
