import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { AppError } from "@/lib/errors/app-error";
import { uploadPromotionCoverQuery } from "@/lib/db/queries/admin-company/promotions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "Archivo de portada requerido.", 422);
    }

    return uploadPromotionCoverQuery(companyId, file, String(formData.get("altText") || "Portada de promoción"));
  });
}
