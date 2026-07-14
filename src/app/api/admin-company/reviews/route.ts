import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getReviewMetricsQuery,
  getReviewsPayloadQuery,
} from "@/lib/db/queries/admin-company/reviews";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { reviewFiltersSchema } from "@/features/admin-company/reviews/schema";
import type { ReviewFilters } from "@/features/admin-company/reviews/types";
import { logger } from "@/lib/observability/logger";

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
        branchId: searchParams.get("branchId"),
        responded: searchParams.get("responded"),
        validated: searchParams.get("validated"),
        page: searchParams.get("page"),
        pageSize: searchParams.get("pageSize"),
      },
      "Los filtros de reseñas no son válidos."
    ) as ReviewFilters;

    const includeMetrics = searchParams.get("includeMetrics") === "true";
    const payload = await getReviewsPayloadQuery(companyId, filters);
    let metrics = null;

    if (includeMetrics) {
      try {
        metrics = await getReviewMetricsQuery(companyId, filters);
      } catch (error) {
        logger.warn("reviews_api_metrics_unavailable", {
          companyId,
          branchId: filters.branchId ?? null,
          error:
            error instanceof Error
              ? { name: error.name, message: error.message }
              : { value: error },
        });
      }
    }

    return {
      ...payload,
      metrics,
    };
  });
}
