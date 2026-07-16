import { NextRequest } from "next/server";
import { promotionCoverFieldsSchema } from "@/features/admin-company/promotions/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import { uploadPromotionCoverQuery } from "@/lib/db/queries/admin-company/promotions";
import { AppError } from "@/lib/errors/app-error";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

const ALLOWED_COVER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_COVER_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("managePromotions");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "Archivo de portada requerido.", 422);
    }
    if (!ALLOWED_COVER_MIME_TYPES.has(file.type)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "La portada debe ser JPG, PNG o WEBP.",
        422,
      );
    }
    if (file.size <= 0 || file.size > MAX_COVER_SIZE_BYTES) {
      throw new AppError(
        "VALIDATION_ERROR",
        "La portada debe pesar como máximo 8 MB.",
        422,
      );
    }

    const { altText } = parseWithSchema(
      promotionCoverFieldsSchema,
      { altText: formData.get("altText") },
      "Los datos de la portada no son válidos.",
    );

    return uploadPromotionCoverQuery(
      companyId,
      file,
      altText ?? "Portada de promoción",
    );
  });
}
