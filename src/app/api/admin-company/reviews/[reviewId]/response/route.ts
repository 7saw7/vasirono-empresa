import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { upsertReviewResponseSchema } from "@/features/admin-company/reviews/schema";
import { upsertReviewResponseQuery } from "@/lib/db/queries/admin-company/reviews";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleRoute(async () => {
    const { reviewId } = await context.params;
    const body = await request.json();

    const parsedId = Number(reviewId);
    const input = parseWithSchema(
      upsertReviewResponseSchema,
      body,
      "Respuesta de reseña inválida."
    );

    return upsertReviewResponseQuery(parsedId, input);
  });
}