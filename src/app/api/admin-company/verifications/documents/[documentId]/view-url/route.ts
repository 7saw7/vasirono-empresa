import { NextRequest } from "next/server";
import { z } from "zod";
import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanyVerificationDocumentViewUrlQuery } from "@/lib/db/queries/admin-company/verifications";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

type Params = Promise<{ documentId: string }>;

const paramsSchema = z.object({
  documentId: z.coerce.number().int().positive(),
});

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("viewVerifications");
    const { documentId } = parseWithSchema(
      paramsSchema,
      await params,
      "El documento solicitado no es válido.",
    );

    return getCompanyVerificationDocumentViewUrlQuery(companyId, documentId);
  });
}
