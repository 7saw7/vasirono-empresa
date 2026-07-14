import { notFound } from "next/navigation";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getReviewMetricsQuery,
  getReviewsPayloadQuery,
} from "@/lib/db/queries/admin-company/reviews";
import type {
  ReviewFilters,
  ReviewsPayload,
} from "@/features/admin-company/reviews/types";
import { logger } from "@/lib/observability/logger";
import { ReviewsView } from "./_components/ReviewsView";

function emptyPayload(filters: ReviewFilters): ReviewsPayload {
  return {
    reviews: [],
    metrics: null,
    meta: {
      total: 0,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const { companyId } = await getCompanyContext("manageReviews");
  const raw = (await searchParams).branchId;
  const branchId = raw ? Number(raw) : undefined;

  if (raw && (!Number.isInteger(branchId) || (branchId ?? 0) <= 0)) {
    notFound();
  }

  const filters: ReviewFilters = {
    branchId,
    page: 1,
    pageSize: 10,
  };

  const [reviewsResult, metricsResult] = await Promise.allSettled([
    getReviewsPayloadQuery(companyId, filters),
    getReviewMetricsQuery(companyId, filters),
  ]);

  let payload = emptyPayload(filters);
  let initialError: string | null = null;

  if (reviewsResult.status === "fulfilled") {
    payload = reviewsResult.value;
  } else {
    logger.error("reviews_page_initial_list_failed", reviewsResult.reason, {
      companyId,
      branchId: branchId ?? null,
    });
    initialError =
      "No se pudieron cargar las reseñas. El panel volverá a intentarlo automáticamente.";
  }

  if (metricsResult.status === "fulfilled") {
    payload = { ...payload, metrics: metricsResult.value };
  } else {
    logger.error("reviews_page_initial_metrics_failed", metricsResult.reason, {
      companyId,
      branchId: branchId ?? null,
    });

    if (!initialError) {
      initialError =
        "Las reseñas se cargaron, pero las métricas no están disponibles temporalmente.";
    }
  }

  return (
    <ReviewsView
      initialPayload={payload}
      initialError={initialError}
      branchId={branchId}
    />
  );
}
