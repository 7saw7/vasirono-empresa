import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { validatePromotionRedemptionQuery } from "@/lib/db/queries/admin-company/promotions";

export const runtime = "nodejs";

type Params = { params: Promise<{ code: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { code } = await params;
    const body = await request.json().catch(() => ({}));

    return validatePromotionRedemptionQuery(
      companyId,
      code,
      typeof body?.branchId === "number" ? body.branchId : undefined,
    );
  });
}
