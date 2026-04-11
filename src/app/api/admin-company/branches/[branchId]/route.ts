import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getBranchByIdQuery,
  updateBranchQuery,
} from "@/lib/db/queries/admin-company/branches";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import {
  branchRouteParamsSchema,
  upsertBranchSchema,
} from "@/features/admin-company/branches/schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    branchId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBranches");
    const rawParams = await context.params;

    const { branchId } = parseWithSchema(
      branchRouteParamsSchema,
      rawParams,
      "El branchId enviado no es válido."
    );

    return getBranchByIdQuery(companyId, branchId);
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBranches");
    const rawParams = await context.params;
    const body = await request.json();

    const { branchId } = parseWithSchema(
      branchRouteParamsSchema,
      rawParams,
      "El branchId enviado no es válido."
    );

    const input = parseWithSchema(
      upsertBranchSchema,
      body,
      "Los datos de la sucursal no son válidos."
    );

    return updateBranchQuery(companyId, branchId, input);
  });
}