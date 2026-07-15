import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { clearSessionCookie } from "@/lib/auth/session";
import { changePasswordQuery } from "@/lib/db/queries/admin-company/settings";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { changePasswordSchema } from "@/features/admin-company/settings/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageSettings");
    const input = parseWithSchema(
      changePasswordSchema,
      await request.json(),
      "Los datos de contraseña no son válidos."
    );
    const result = await changePasswordQuery(companyId, input);
    await clearSessionCookie();
    return result;
  });
}
