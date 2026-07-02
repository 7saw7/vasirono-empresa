import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import {
  createPromotionQuery,
  listPromotionsQuery,
} from "@/lib/db/queries/admin-company/promotions";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const searchParams = request.nextUrl.searchParams;

    return listPromotionsQuery(companyId, {
      page: Number(searchParams.get("page") || 1),
      pageSize: Number(searchParams.get("pageSize") || 20),
      search: searchParams.get("search") || undefined,
      branchId: searchParams.get("branchId") ? Number(searchParams.get("branchId")) : undefined,
      status: searchParams.get("status") || undefined,
      active: searchParams.get("active") === null ? undefined : searchParams.get("active") === "true",
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const body = await request.json();
    return createPromotionQuery(companyId, body);
  });
}
