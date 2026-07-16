import { NextRequest } from "next/server";
import { promotionRouteParamsSchema } from "@/features/admin-company/promotions/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { activatePromotionQuery } from "@/lib/db/queries/admin-company/promotions";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

type Params = { params: Promise<{ promotionId: string }> };

export async function PATCH(_request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { promotionId } = parseWithSchema(
      promotionRouteParamsSchema,
      await params,
      "La promoción indicada no es válida.",
    );
    return activatePromotionQuery(companyId, promotionId);
  });
}
