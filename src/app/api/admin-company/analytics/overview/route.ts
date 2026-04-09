import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { analyticsFiltersSchema } from "@/features/admin-company/analytics/schema";
import { getAnalyticsOverviewQuery } from "@/lib/db/queries/admin-company/analytics";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);

    const filters = parseWithSchema(
      analyticsFiltersSchema,
      {
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        branchId: searchParams.get("branchId") ?? undefined,
        source: searchParams.get("source") ?? undefined,
      },
      "Filtros de analytics inválidos."
    );

    return getAnalyticsOverviewQuery(filters);
  });
}