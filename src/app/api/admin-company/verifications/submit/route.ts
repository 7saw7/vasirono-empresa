import { NextRequest } from "next/server";
import { submitVerificationSchema } from "@/features/admin-company/verifications/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import { submitCompanyVerificationQuery } from "@/lib/db/queries/admin-company/verifications";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("submitVerification");
    const input = parseWithSchema(
      submitVerificationSchema,
      await request.json(),
      "Los datos de envío no son válidos.",
    );

    return submitCompanyVerificationQuery(companyId, input);
  });
}
