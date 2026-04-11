import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  createBranchQuery,
  listBranchesQuery,
} from "@/lib/db/queries/admin-company/branches";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import {
  branchFiltersSchema,
  upsertBranchSchema,
} from "@/features/admin-company/branches/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBranches");
    const { searchParams } = new URL(request.url);

    const filters = parseWithSchema(
      branchFiltersSchema,
      {
        search: searchParams.get("search"),
        status: searchParams.get("status"),
        districtId: searchParams.get("districtId"),
      },
      "Los filtros enviados no son válidos."
    );

    return listBranchesQuery(companyId, filters);
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBranches");
    const body = await request.json();

    const input = parseWithSchema(
      upsertBranchSchema,
      body,
      "Los datos de la sucursal no son válidos."
    );

    return createBranchQuery(companyId, input);
  });
}