import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { branchServiceAvailabilitySchema, branchServiceRouteParamsSchema } from "@/features/admin-company/branches/schema";
import { detachBranchServiceQuery, updateBranchServiceAvailabilityQuery } from "@/lib/db/queries/admin-company/branches";
type Params = Promise<{ branchId: string; serviceId: string }>;
export async function PATCH(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const parsed = parseWithSchema(branchServiceRouteParamsSchema, await params); const body = parseWithSchema(branchServiceAvailabilitySchema, await request.json()); return updateBranchServiceAvailabilityQuery(companyId, parsed.branchId, parsed.serviceId, body.isAvailable); }); }
export async function DELETE(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const parsed = parseWithSchema(branchServiceRouteParamsSchema, await params); return detachBranchServiceQuery(companyId, parsed.branchId, parsed.serviceId); }); }
