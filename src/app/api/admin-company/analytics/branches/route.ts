import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { getAnalyticsOverviewQuery } from "@/lib/db/queries/admin-company/analytics";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { analyticsFiltersSchema } from "@/features/admin-company/analytics/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("viewAnalytics");
    const { searchParams } = new URL(request.url);

    const filters = parseWithSchema(
      analyticsFiltersSchema,
      {
        from: searchParams.get("from"),
        to: searchParams.get("to"),
        branchId: searchParams.get("branchId"),
        source: searchParams.get("source"),
      },
      "Los filtros analíticos no son válidos."
    );

    return getAnalyticsOverviewQuery(companyId, filters);
  });
}