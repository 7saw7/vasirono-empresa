import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchRouteParamsSchema } from "@/features/admin-company/branches/schema";
import { listBranchMediaQuery, listMediaTypesQuery } from "@/lib/db/queries/admin-company/media";

type Params = Promise<{ branchId: string }>;

export async function GET(_: NextRequest, { params }: { params: Params }) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    const { branchId } = parseWithSchema(branchRouteParamsSchema, await params);
    const [mediaTypes, media] = await Promise.all([
      listMediaTypesQuery(companyId),
      listBranchMediaQuery(companyId, branchId),
    ]);
    return { mediaTypes, media };
  });
}
