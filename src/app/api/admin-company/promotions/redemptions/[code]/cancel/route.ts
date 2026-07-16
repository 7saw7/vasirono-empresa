import { NextRequest } from "next/server";
import {
  promotionRedemptionCancellationSchema,
  promotionRedemptionCodeParamsSchema,
} from "@/features/admin-company/promotions/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import { cancelPromotionRedemptionQuery } from "@/lib/db/queries/admin-company/promotions";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

type Params = { params: Promise<{ code: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const { code } = parseWithSchema(
      promotionRedemptionCodeParamsSchema,
      await params,
      "El código de redención no es válido.",
    );
    const { reason } = parseWithSchema(
      promotionRedemptionCancellationSchema,
      await request.json().catch(() => ({})),
      "Los datos de cancelación no son válidos.",
    );

    return cancelPromotionRedemptionQuery(companyId, code, reason);
  });
}
