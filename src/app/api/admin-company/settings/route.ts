import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getCompanySettingsQuery,
  updateNotificationPreferencesQuery,
} from "@/lib/db/queries/admin-company/settings";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { notificationPreferencesSchema } from "@/features/admin-company/settings/schema";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageSettings");
    return getCompanySettingsQuery(companyId);
  });
}

export async function PUT(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageSettings");
    const body = await request.json();

    const input = parseWithSchema(
      notificationPreferencesSchema,
      body,
      "La configuración enviada no es válida."
    );

    return updateNotificationPreferencesQuery(companyId, input);
  });
}