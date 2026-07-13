import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchRouteParamsSchema, branchScheduleInputSchema } from "@/features/admin-company/branches/schema";
import { listBranchSchedulesQuery, upsertBranchScheduleQuery } from "@/lib/db/queries/admin-company/branches";
type Params = Promise<{ branchId: string }>;
export async function GET(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId } = parseWithSchema(branchRouteParamsSchema, await params); return listBranchSchedulesQuery(companyId, branchId); }); }
export async function POST(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId } = parseWithSchema(branchRouteParamsSchema, await params); const input = parseWithSchema(branchScheduleInputSchema, await request.json()); return upsertBranchScheduleQuery(companyId, branchId, input); }); }
