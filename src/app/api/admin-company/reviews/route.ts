import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { reviewFiltersSchema } from "@/features/admin-company/reviews/schema";
import {
  getReviewMetricsQuery,
  listReviewsQuery,
} from "@/lib/db/queries/admin-company/reviews";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);

    const filters = parseWithSchema(
      reviewFiltersSchema,
      {
        search: searchParams.get("search") ?? undefined,
        rating: searchParams.get("rating") ?? undefined,
        branchId: searchParams.get("branchId") ?? undefined,
        responded: searchParams.get("responded") ?? undefined,
        validated: searchParams.get("validated") ?? undefined,
      },
      "Filtros de reseñas inválidos."
    );

    const includeMetrics = searchParams.get("includeMetrics") === "true";

    const [reviews, metrics] = await Promise.all([
      listReviewsQuery(filters),
      includeMetrics ? getReviewMetricsQuery() : Promise.resolve(null),
    ]);

    return {
      reviews,
      metrics,
    };
  });
}