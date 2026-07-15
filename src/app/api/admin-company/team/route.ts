import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { hasPermission } from "@/lib/constants/permissions";
import { handleRoute } from "@/lib/http/handle-route";
import {
  addTeamMemberQuery,
  getTeamOverviewQuery,
} from "@/lib/db/queries/admin-company/team";
import { addTeamMemberSchema } from "@/features/admin-company/team/schema";
import { parseWithSchema } from "@/lib/validation/parse";
import { readJsonBody } from "@/lib/http/read-json-body";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const context = await getCompanyContext("viewTeam");
    return getTeamOverviewQuery(context.companyId, {
      currentUserId: context.userId,
      canManageTeam: hasPermission(context.role, "manageTeam"),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageTeam");
    const body = await readJsonBody(request);
    const input = parseWithSchema(
      addTeamMemberSchema,
      body,
      "Los datos del integrante no son válidos.",
    );

    return addTeamMemberQuery(companyId, input);
  });
}
