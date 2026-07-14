import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { uploadCompanyVerificationDocumentQuery } from "@/lib/db/queries/admin-company/verifications";
import { AppError } from "@/lib/errors/app-error";
import { handleRoute } from "@/lib/http/handle-route";

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
    const { companyId } = await getCompanyContext("viewVerifications");
    const formData = await request.formData();
    const file = formData.get("file");
    const documentTypeCode = String(formData.get("documentTypeCode") ?? "").trim();
    const branchIdRaw = String(formData.get("branchId") ?? "").trim();

    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "Selecciona un archivo.", 422);
    }
    if (!documentTypeCode || documentTypeCode.length > 50) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Selecciona un tipo de documento válido.",
        422,
      );
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

    const branchId = branchIdRaw ? Number(branchIdRaw) : null;
    if (branchId !== null && (!Number.isInteger(branchId) || branchId <= 0)) {
      throw new AppError("VALIDATION_ERROR", "La sucursal no es válida.", 422);
    }

    return uploadCompanyVerificationDocumentQuery(companyId, {
      file,
      documentTypeCode,
      branchId,
      notes: nullableFormValue(formData.get("notes")),
      extractedAddress: nullableFormValue(formData.get("extractedAddress")),
      extractedName: nullableFormValue(formData.get("extractedName")),
      extractedDocumentNumber: nullableFormValue(
        formData.get("extractedDocumentNumber"),
      ),
      extractedIssueDate: nullableFormValue(formData.get("extractedIssueDate")),
    });
  });
}

function nullableFormValue(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}
