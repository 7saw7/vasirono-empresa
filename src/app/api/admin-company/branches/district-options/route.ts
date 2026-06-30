import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { listBranchDistrictOptionsQuery } from "@/lib/db/queries/admin-company/branches";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageBranches");

    const items = await listBranchDistrictOptionsQuery(companyId);

    return items;
  });
}