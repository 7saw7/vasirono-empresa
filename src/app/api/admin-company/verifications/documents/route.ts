import { NextRequest } from "next/server";
import { verificationDocumentUploadFieldsSchema } from "@/features/admin-company/verifications/schema";
import { getCompanyContext } from "@/lib/auth/company-context";
import { uploadCompanyVerificationDocumentQuery } from "@/lib/db/queries/admin-company/verifications";
import { AppError } from "@/lib/errors/app-error";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("submitVerification");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "Selecciona un archivo.", 422);
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "El documento debe ser PDF, JPG, PNG o WEBP.",
        422,
      );
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        "VALIDATION_ERROR",
        "El documento debe pesar como máximo 10 MB.",
        422,
      );
    }

    const fields = parseWithSchema(
      verificationDocumentUploadFieldsSchema,
      {
        documentTypeCode: formData.get("documentTypeCode"),
        branchId: formData.get("branchId"),
        notes: formData.get("notes"),
        extractedAddress: formData.get("extractedAddress"),
        extractedName: formData.get("extractedName"),
        extractedDocumentNumber: formData.get("extractedDocumentNumber"),
        extractedIssueDate: formData.get("extractedIssueDate"),
      },
      "Los datos del documento no son válidos.",
    );

    return uploadCompanyVerificationDocumentQuery(companyId, {
      file,
      ...fields,
    });
  });
}
