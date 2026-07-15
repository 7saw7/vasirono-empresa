import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { updateTeamMemberRoleQuery } from "@/lib/db/queries/admin-company/team";
import {
  teamMemberParamsSchema,
  updateTeamMemberRoleSchema,
} from "@/features/admin-company/team/schema";
import { parseWithSchema } from "@/lib/validation/parse";
import { readJsonBody } from "@/lib/http/read-json-body";

type Params = Promise<{ userId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageTeam");
    const routeParams = parseWithSchema(
      teamMemberParamsSchema,
      await params,
      "El integrante indicado no es válido.",
    );
    const input = parseWithSchema(
      updateTeamMemberRoleSchema,
      await readJsonBody(request),
      "El rol seleccionado no es válido.",
    );

    return updateTeamMemberRoleQuery(
      companyId,
      routeParams.userId,
      input.roleId,
    );
  });
}
