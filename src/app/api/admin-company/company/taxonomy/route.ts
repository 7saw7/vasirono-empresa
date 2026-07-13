import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getCompanyTaxonomyQuery,
  updateCompanyTaxonomyQuery,
} from "@/lib/db/queries/admin-company/company";
import { handleRoute } from "@/lib/http/handle-route";
import { validateUpdateCompanyTaxonomyInput } from "@/features/admin-company/company/schema";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageCompany");
    return getCompanyTaxonomyQuery(companyId);
  });
}

export async function PUT(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageCompany");
    const body = await request.json();
    const input = validateUpdateCompanyTaxonomyInput(body);
    return updateCompanyTaxonomyQuery(companyId, input);
  });
}
