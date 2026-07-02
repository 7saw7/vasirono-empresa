import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { setTeamMemberActiveQuery } from "@/lib/db/queries/admin-company/team";

type Params = Promise<{ userId: string }>;

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageTeam");
    const { userId } = await params;
    const body = await request.json();
    return setTeamMemberActiveQuery(companyId, userId, Boolean(body.active));
  });
}
