import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchRouteParamsSchema, branchServiceAttachInputSchema } from "@/features/admin-company/branches/schema";
import { attachBranchServiceQuery, listServiceCatalogQuery } from "@/lib/db/queries/admin-company/branches";
type Params = Promise<{ branchId: string }>;
export async function GET(_: NextRequest, { params }: { params: Params }) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBranches");
    parseWithSchema(branchRouteParamsSchema, await params);
    return listServiceCatalogQuery(companyId);
  });
}
export async function POST(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId } = parseWithSchema(branchRouteParamsSchema, await params); const input = parseWithSchema(branchServiceAttachInputSchema, await request.json()); return attachBranchServiceQuery(companyId, branchId, input); }); }
