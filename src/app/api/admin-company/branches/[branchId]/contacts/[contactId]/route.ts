import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { deleteBranchContactQuery, updateBranchContactQuery } from "@/lib/db/queries/admin-company/branches";

type Params = Promise<{ branchId: string; contactId: string }>;
export async function PUT(request: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, contactId } = await params; return updateBranchContactQuery(companyId, Number(branchId), Number(contactId), await request.json()); }); }
export async function DELETE(_: NextRequest, { params }: { params: Params }) { return handleRoute(async () => { const { companyId } = await getCompanyContext("manageBranches"); const { branchId, contactId } = await params; return deleteBranchContactQuery(companyId, Number(branchId), Number(contactId)); }); }
