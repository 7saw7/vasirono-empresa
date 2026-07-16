import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { upgradeCheckoutSchema } from "@/features/admin-company/billing/schema";
import { createUpgradeCheckoutQuery } from "@/lib/db/queries/admin-company/billing";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("changeBillingPlan");
    const body = await request.json();
    const input = parseWithSchema(
      upgradeCheckoutSchema,
      body,
      "Los datos del cambio de plan no son válidos.",
    );

    return createUpgradeCheckoutQuery(companyId, input);
  });
}
