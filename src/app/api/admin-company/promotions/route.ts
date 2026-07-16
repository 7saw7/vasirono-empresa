import { NextRequest } from "next/server";
import { promotionListFiltersSchema } from "@/features/admin-company/promotions/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  createPromotionQuery,
  listPromotionsQuery,
} from "@/lib/db/queries/admin-company/promotions";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const searchParams = request.nextUrl.searchParams;
    const filters = parseWithSchema(
      promotionListFiltersSchema,
      {
        page: searchParams.get("page"),
        pageSize: searchParams.get("pageSize"),
        search: searchParams.get("search"),
        branchId: searchParams.get("branchId"),
        status: searchParams.get("status"),
        active: searchParams.get("active"),
      },
      "Los filtros de promociones no son válidos.",
    );

    return listPromotionsQuery(companyId, filters);
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    return createPromotionQuery(companyId, await request.json());
  });
}
