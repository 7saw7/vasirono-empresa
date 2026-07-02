import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { setPrimaryBranchContactQuery } from "@/lib/db/queries/admin-company/branches";

type Params = Promise<{ branchId: string; contactId: string }>;
export async function PATCH(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, contactId } = await params; return setPrimaryBranchContactQuery(companyId, Number(branchId), Number(contactId)); }); }
