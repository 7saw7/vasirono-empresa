import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchRouteParamsSchema } from "@/features/admin-company/branches/schema";
import { reorderBranchMediaSchema } from "@/features/admin-company/media/schema";
import { reorderBranchMediaQuery } from "@/lib/db/queries/admin-company/media";

type Params = Promise<{ branchId: string }>;

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    const { branchId } = parseWithSchema(branchRouteParamsSchema, await params);
    const body = parseWithSchema(reorderBranchMediaSchema, await request.json());
    return reorderBranchMediaQuery(companyId, branchId, body.items);
  });
}
