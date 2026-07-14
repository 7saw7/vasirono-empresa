import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { AppError } from "@/lib/errors/app-error";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { reorderBranchMediaSchema } from "@/features/admin-company/media/schema";
import {
  reorderBranchMediaQuery,
  reorderCompanyMediaQuery,
} from "@/lib/db/queries/admin-company/media";

export async function PATCH(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    const raw = await request.json();
    const ownerType = String(raw?.ownerType ?? "");
    const ownerId = Number(raw?.ownerId ?? 0);
    const body = parseWithSchema(reorderBranchMediaSchema, raw);

    if (ownerType === "company") {
      return reorderCompanyMediaQuery(companyId, body.items);
    }

    if (ownerType === "branch" && Number.isInteger(ownerId) && ownerId > 0) {
      return reorderBranchMediaQuery(companyId, ownerId, body.items);
    }

    throw new AppError("VALIDATION_ERROR", "Destino de ordenamiento inválido.", 422);
  });
}
