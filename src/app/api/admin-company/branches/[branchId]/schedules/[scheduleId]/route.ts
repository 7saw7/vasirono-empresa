import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { deleteBranchScheduleQuery } from "@/lib/db/queries/admin-company/branches";

type Params = Promise<{ branchId: string; scheduleId: string }>;
export async function DELETE(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, scheduleId } = await params; return deleteBranchScheduleQuery(companyId, Number(branchId), Number(scheduleId)); }); }
