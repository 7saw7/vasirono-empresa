import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanyVerificationsQuery } from "@/lib/db/queries/admin-company/verifications";
import { handleRoute } from "@/lib/http/handle-route";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("viewVerifications");
    return getCompanyVerificationsQuery(companyId);
  });
}