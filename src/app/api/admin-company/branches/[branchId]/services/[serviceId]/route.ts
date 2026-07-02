import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { detachBranchServiceQuery, updateBranchServiceAvailabilityQuery } from "@/lib/db/queries/admin-company/branches";

type Params = Promise<{ branchId: string; serviceId: string }>;
export async function PATCH(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, serviceId } = await params; const body = await request.json(); return updateBranchServiceAvailabilityQuery(companyId, Number(branchId), Number(serviceId), Boolean(body.isAvailable)); }); }
export async function DELETE(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, serviceId } = await params; return detachBranchServiceQuery(companyId, Number(branchId), Number(serviceId)); }); }
