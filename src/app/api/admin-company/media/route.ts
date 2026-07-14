import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { AppError } from "@/lib/errors/app-error";
import { getGalleryOverviewQuery, uploadGalleryMediaQuery } from "@/lib/db/queries/admin-company/media";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    return getGalleryOverviewQuery(companyId);
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    const formData = await request.formData();
    const file = formData.get("file");
    const ownerType = String(formData.get("ownerType") || "company");
    const ownerId = ownerType === "company" ? companyId : Number(formData.get("ownerId") || companyId);
    const mediaTypeId = Number(formData.get("mediaTypeId") || 0);

    if (!(file instanceof File)) throw new AppError("VALIDATION_ERROR", "Archivo requerido.", 422);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new AppError("VALIDATION_ERROR", "Solo se admiten imágenes JPG, PNG o WEBP.", 422);
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new AppError("VALIDATION_ERROR", "La imagen supera el límite de 8 MB.", 413);
    }
    if (ownerType !== "company" && ownerType !== "branch") throw new AppError("VALIDATION_ERROR", "Tipo de propietario inválido.", 422);
    if (!Number.isInteger(ownerId) || ownerId <= 0) throw new AppError("VALIDATION_ERROR", "ownerId inválido.", 422);
    if (!Number.isInteger(mediaTypeId) || mediaTypeId <= 0) throw new AppError("VALIDATION_ERROR", "Tipo de media inválido.", 422);

    return uploadGalleryMediaQuery(companyId, {
      ownerType,
      ownerId,
      mediaTypeId,
      file,
      altText: String(formData.get("altText") || "") || null,
      isCover: String(formData.get("isCover") || "false") === "true",
    });
  });
}
