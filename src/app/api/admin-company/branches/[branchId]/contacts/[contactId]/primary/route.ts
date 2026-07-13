import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchContactRouteParamsSchema } from "@/features/admin-company/branches/schema";
import { setPrimaryBranchContactQuery } from "@/lib/db/queries/admin-company/branches";
type Params = Promise<{ branchId: string; contactId: string }>;
export async function PATCH(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const parsed = parseWithSchema(branchContactRouteParamsSchema, await params); return setPrimaryBranchContactQuery(companyId, parsed.branchId, parsed.contactId); }); }
