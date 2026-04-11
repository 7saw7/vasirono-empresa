import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getCompanyProfileQuery,
  updateCompanyProfileQuery,
} from "@/lib/db/queries/admin-company/company";
import { handleRoute } from "@/lib/http/handle-route";
import { validateUpdateCompanyProfileInput } from "@/features/admin-company/company/schema";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageCompany");
    return getCompanyProfileQuery(companyId);
  });
}

export async function PUT(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageCompany");
    const body = await request.json();

    const input = validateUpdateCompanyProfileInput(body);

    return updateCompanyProfileQuery(companyId, input);
  });
}