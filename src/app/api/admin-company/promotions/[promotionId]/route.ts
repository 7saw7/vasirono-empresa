import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import {
  deletePromotionQuery,
  updatePromotionQuery,
} from "@/lib/db/queries/admin-company/promotions";

export const runtime = "nodejs";

type Params = { params: Promise<{ promotionId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { promotionId } = await params;
    const body = await request.json();
    return updatePromotionQuery(companyId, Number(promotionId), body);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { promotionId } = await params;
    return deletePromotionQuery(companyId, Number(promotionId));
  });
}
