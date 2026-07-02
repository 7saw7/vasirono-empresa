import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { addTeamMemberQuery, getTeamOverviewQuery } from "@/lib/db/queries/admin-company/team";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageTeam");
    return getTeamOverviewQuery(companyId);
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageTeam");
    const body = await request.json();
    return addTeamMemberQuery(companyId, {
      userEmail: typeof body.userEmail === "string" ? body.userEmail : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      roleId: Number(body.roleId),
    });
  });
}
