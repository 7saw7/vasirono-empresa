import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { listReviewsQuery } from "@/lib/db/queries/admin-company/reviews";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { reviewFiltersSchema } from "@/features/admin-company/reviews/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageReviews");
    const { searchParams } = new URL(request.url);

    const filters = parseWithSchema(
      reviewFiltersSchema,
      {
        search: searchParams.get("search"),
        rating: searchParams.get("rating"),
        responseStatus: searchParams.get("responseStatus"),
      },
      "Los filtros de reseñas no son válidos."
    );

    return listReviewsQuery(companyId, filters);
  });
}