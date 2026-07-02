import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { deleteBranchHourExceptionQuery, updateBranchHourExceptionQuery } from "@/lib/db/queries/admin-company/branches";

type Params = Promise<{ branchId: string; exceptionId: string }>;
export async function PUT(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, exceptionId } = await params; return updateBranchHourExceptionQuery(companyId, Number(branchId), Number(exceptionId), await request.json()); }); }
export async function DELETE(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, exceptionId } = await params; return deleteBranchHourExceptionQuery(companyId, Number(branchId), Number(exceptionId)); }); }
