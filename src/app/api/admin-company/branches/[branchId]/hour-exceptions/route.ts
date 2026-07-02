import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { createBranchHourExceptionQuery, listBranchHourExceptionsQuery } from "@/lib/db/queries/admin-company/branches";

type Params = Promise<{ branchId: string }>;
export async function GET(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId } = await params; return listBranchHourExceptionsQuery(companyId, Number(branchId)); }); }
export async function POST(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId } = await params; return createBranchHourExceptionQuery(companyId, Number(branchId), await request.json()); }); }
