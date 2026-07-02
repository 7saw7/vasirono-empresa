import { NextRequest } from "next/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { handleRoute } from "@/lib/http/handle-route";
import { AppError } from "@/lib/errors/app-error";
import { deleteGalleryMediaQuery, updateGalleryMediaQuery } from "@/lib/db/queries/admin-company/media";

type Params = Promise<{ ownerType: string; ownerId: string; mediaId: string }>;

function parseParams(raw: { ownerType: string; ownerId: string; mediaId: string }) {
  if (raw.ownerType !== "company" && raw.ownerType !== "branch") {
    throw new AppError("VALIDATION_ERROR", "Tipo de propietario inválido.", 422);
  }
  const ownerId = Number(raw.ownerId);
  const mediaId = Number(raw.mediaId);
  if (!Number.isInteger(ownerId) || ownerId <= 0 || !Number.isInteger(mediaId) || mediaId <= 0) {
    throw new AppError("VALIDATION_ERROR", "Parámetros inválidos.", 422);
  }
  return { ownerType: raw.ownerType, ownerId, mediaId };
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    const parsed = parseParams(await params);
    const body = await request.json();
    return updateGalleryMediaQuery(companyId, {
      ...parsed,
      altText: typeof body.altText === "string" ? body.altText : null,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    });
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Params }) {
  return handleRoute(async () => {
    const { companyId } = await getCompanyContext("manageMedia");
    return deleteGalleryMediaQuery(companyId, parseParams(await params));
  });
}
