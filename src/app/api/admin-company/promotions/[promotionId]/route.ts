import { NextRequest } from "next/server";
import { promotionRouteParamsSchema } from "@/features/admin-company/promotions/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  deletePromotionQuery,
  updatePromotionQuery,
} from "@/lib/db/queries/admin-company/promotions";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

type Params = { params: Promise<{ promotionId: string }> };

async function parseParams(params: Params["params"]) {
  return parseWithSchema(
    promotionRouteParamsSchema,
    await params,
    "La promoción indicada no es válida.",
  );
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { promotionId } = await parseParams(params);
    return updatePromotionQuery(companyId, promotionId, await request.json());
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { promotionId } = await parseParams(params);
    return deletePromotionQuery(companyId, promotionId);
  });
}
