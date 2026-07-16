import { NextRequest } from "next/server";
import { requestVerificationSchema } from "@/features/admin-company/verifications/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import { requestCompanyVerificationQuery } from "@/lib/db/queries/admin-company/verifications";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("requestVerification");
    const input = parseWithSchema(
      requestVerificationSchema,
      await request.json(),
      "Los datos de la solicitud no son válidos.",
    );

    return requestCompanyVerificationQuery(companyId, input);
  });
}
