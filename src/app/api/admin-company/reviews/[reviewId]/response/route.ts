import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { upsertReviewResponseQuery } from "@/lib/db/queries/admin-company/reviews";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import {
  reviewResponseParamsSchema,
  upsertReviewResponseSchema,
} from "@/features/admin-company/reviews/schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

async function handleUpsertReviewResponse(
  request: NextRequest,
  context: RouteContext
) {
  return handleRoute(async () => {
    const { companyId, userId } = await getCompanyContext("manageReviews");
    const rawParams = await context.params;
    const body = await request.json();

    const { reviewId } = parseWithSchema(
      reviewResponseParamsSchema,
      rawParams,
      "El reviewId enviado no es válido."
    );

    const input = parseWithSchema(
      upsertReviewResponseSchema,
      body,
      "La respuesta de reseña no es válida."
    );

    return upsertReviewResponseQuery({
      companyId,
      userId,
      reviewId,
      input,
    });
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleUpsertReviewResponse(request, context);
}

/**
 * Compatibilidad temporal.
 * Puedes eliminar esto cuando confirmes que nadie usa POST.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return handleUpsertReviewResponse(request, context);
}