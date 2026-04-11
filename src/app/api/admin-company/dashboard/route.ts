import { getDashboardQuery } from "@/lib/db/queries/admin-company/dashboard";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("viewDashboard");
    return getDashboardQuery(companyId);
  });
}