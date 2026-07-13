import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchExceptionRouteParamsSchema, branchHourExceptionInputSchema } from "@/features/admin-company/branches/schema";
import { deleteBranchHourExceptionQuery, updateBranchHourExceptionQuery } from "@/lib/db/queries/admin-company/branches";
type Params = Promise<{ branchId: string; exceptionId: string }>;
export async function PUT(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const parsed = parseWithSchema(branchExceptionRouteParamsSchema, await params); const input = parseWithSchema(branchHourExceptionInputSchema, await request.json()); return updateBranchHourExceptionQuery(companyId, parsed.branchId, parsed.exceptionId, input); }); }
export async function DELETE(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const parsed = parseWithSchema(branchExceptionRouteParamsSchema, await params); return deleteBranchHourExceptionQuery(companyId, parsed.branchId, parsed.exceptionId); }); }
