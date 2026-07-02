import { AppError } from "@/lib/errors/app-error";
import { serviceRequest, buildServiceUrl } from "@/lib/http/service-client";
import { asRecord, pick, toBoolean, toNullableNumber, toNumber, toStringValue, unwrapList, type AnyRecord } from "@/lib/http/service-data";
import { getRawSessionToken, getSession } from "@/lib/auth/session";
import { listBranchesQuery } from "@/lib/db/queries/admin-company/branches";
import { getCurrentPlanQuery } from "@/lib/db/queries/admin-company/billing";
import type { GalleryMediaItem, GalleryOverview, MediaOwnerType, MediaTypeOption } from "@/features/admin-company/media/types";

export async function getGalleryOverviewQuery(companyId: number): Promise<GalleryOverview> {
  const [mediaTypes, branches, companyMedia, plan] = await Promise.all([
    listMediaTypesQuery(companyId),
    listBranchesQuery(companyId).catch(() => []),
    listCompanyMediaQuery(companyId).catch(() => []),
    getCurrentPlanQuery(companyId).catch(() => null),
  ]);

  const branchMediaGroups = await Promise.all(
    branches.map(async (branch) => ({
      branch,
      media: await listBranchMediaQuery(companyId, branch.branchId, branch.name).catch(() => []),
    })),
  );

  const branchMedia = branchMediaGroups.flatMap((group) => group.media);

  return {
    mediaTypes,
    companyMedia,
    branchMedia,
    branches: branches.map((branch) => ({ branchId: branch.branchId, name: branch.name })),
    planLimit: plan?.limits.media ?? null,
    usedMedia: companyMedia.length + branchMedia.length,
  };
}

export async function listMediaTypesQuery(companyId: number): Promise<MediaTypeOption[]> {
  const payload = await serviceRequest<unknown>({
    service: "media",
    companyId,
    directPath: "/api/media/types",
    gatewayPath: "/api/media/api/media/types",
    errorCode: "MEDIA_TYPES_ERROR",
    errorMessage: "No se pudo cargar los tipos de media.",
  });

  return unwrapList(payload, "items", "data", "mediaTypes").map((row) => ({
    id: toNumber(pick(row, "id", "mediaTypeId", "media_type_id")),
    name: toStringValue(pick(row, "name", "code"), "gallery"),
    isUnique: toBoolean(pick(row, "isUnique", "is_unique"), false),
  }));
}

export async function listCompanyMediaQuery(companyId: number): Promise<GalleryMediaItem[]> {
  const payload = await serviceRequest<unknown>({
    service: "media",
    companyId,
    directPath: `/api/media/companies/${companyId}`,
    gatewayPath: `/api/media/api/media/companies/${companyId}`,
    errorCode: "COMPANY_MEDIA_ERROR",
    errorMessage: "No se pudo cargar la galería del negocio.",
  });

  return unwrapList(payload, "items", "data", "media").map((row) => normalizeMedia(row, "company", companyId, "Negocio"));
}

export async function listBranchMediaQuery(
  companyId: number,
  branchId: number,
  branchName = "Sucursal",
): Promise<GalleryMediaItem[]> {
  const payload = await serviceRequest<unknown>({
    service: "media",
    companyId,
    directPath: `/api/media/branches/${branchId}`,
    gatewayPath: `/api/media/api/media/branches/${branchId}`,
    errorCode: "BRANCH_MEDIA_ERROR",
    errorMessage: "No se pudo cargar la galería de la sucursal.",
  });

  return unwrapList(payload, "items", "data", "media").map((row) => normalizeMedia(row, "branch", branchId, branchName));
}

export async function uploadGalleryMediaQuery(
  companyId: number,
  input: {
    ownerType: MediaOwnerType;
    ownerId: number;
    file: File;
    mediaTypeId: number;
    altText?: string | null;
    isCover?: boolean;
  },
): Promise<GalleryMediaItem> {
  const formData = new FormData();
  formData.set("file", input.file);
  formData.set("mediaTypeId", String(input.mediaTypeId));
  formData.set("isCover", String(Boolean(input.isCover)));
  if (input.altText) formData.set("altText", input.altText);

  const directPath = input.ownerType === "company"
    ? `/api/media/companies/${companyId}`
    : `/api/media/branches/${input.ownerId}`;
  const gatewayPath = input.ownerType === "company"
    ? `/api/media/api/media/companies/${companyId}`
    : `/api/media/api/media/branches/${input.ownerId}`;

  const url = buildServiceUrl({ service: "media", directPath, gatewayPath });
  const token = await getRawSessionToken();
  const session = await getSession();

  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(session
        ? {
            "x-user-id": session.userId,
            "x-user-email": session.email,
            "x-user-role": session.role,
            "x-role-name": session.role,
            "x-portal": "company",
            "x-company-id": String(companyId),
            "x-company-ids": String(companyId),
            "x-user-permissions": [
              "media:types:read",
              "media:company:read",
              "media:company:write",
              "media:company:delete",
              "media:branch:read",
              "media:branch:write",
              "media:branch:delete",
            ].join(","),
          }
        : {}),
    },
    body: formData,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const errorRow = asRecord(pick(asRecord(payload), "error"));
    throw new AppError(
      toStringValue(pick(errorRow, "code"), "MEDIA_UPLOAD_ERROR"),
      toStringValue(pick(errorRow, "message"), "No se pudo subir la imagen."),
      response.status || 502,
    );
  }

  const data = asRecord(pick(asRecord(payload), "data") ?? payload);
  return normalizeMedia(data, input.ownerType, input.ownerType === "company" ? companyId : input.ownerId, input.ownerType === "company" ? "Negocio" : "Sucursal");
}

export async function updateGalleryMediaQuery(
  companyId: number,
  input: {
    ownerType: MediaOwnerType;
    ownerId: number;
    mediaId: number;
    altText?: string | null;
    isActive?: boolean;
  },
): Promise<GalleryMediaItem> {
  const directPath = input.ownerType === "company"
    ? `/api/media/companies/${companyId}/${input.mediaId}`
    : `/api/media/branches/${input.ownerId}/${input.mediaId}`;
  const gatewayPath = input.ownerType === "company"
    ? `/api/media/api/media/companies/${companyId}/${input.mediaId}`
    : `/api/media/api/media/branches/${input.ownerId}/${input.mediaId}`;

  const payload = await serviceRequest<unknown, { altText?: string | null; isActive?: boolean }>({
    service: "media",
    companyId,
    directPath,
    gatewayPath,
    method: "PATCH",
    body: { altText: input.altText ?? null, isActive: input.isActive },
    errorCode: "MEDIA_UPDATE_ERROR",
    errorMessage: "No se pudo actualizar la imagen.",
  });

  return normalizeMedia(asRecord(payload), input.ownerType, input.ownerId, input.ownerType === "company" ? "Negocio" : "Sucursal");
}

export async function deleteGalleryMediaQuery(
  companyId: number,
  input: { ownerType: MediaOwnerType; ownerId: number; mediaId: number },
): Promise<unknown> {
  const directPath = input.ownerType === "company"
    ? `/api/media/companies/${companyId}/${input.mediaId}`
    : `/api/media/branches/${input.ownerId}/${input.mediaId}`;
  const gatewayPath = input.ownerType === "company"
    ? `/api/media/api/media/companies/${companyId}/${input.mediaId}`
    : `/api/media/api/media/branches/${input.ownerId}/${input.mediaId}`;

  return serviceRequest<unknown>({
    service: "media",
    companyId,
    directPath,
    gatewayPath,
    method: "DELETE",
    errorCode: "MEDIA_DELETE_ERROR",
    errorMessage: "No se pudo eliminar la imagen.",
  });
}

function normalizeMedia(row: AnyRecord, ownerType: MediaOwnerType, fallbackOwnerId: number, ownerLabel: string): GalleryMediaItem {
  return {
    mediaId: toNumber(pick(row, "mediaId", "media_id", "id")),
    ownerId: toNumber(pick(row, "ownerId", "owner_id"), fallbackOwnerId),
    ownerType,
    mediaTypeId: toNumber(pick(row, "mediaTypeId", "media_type_id")),
    mediaTypeName: pick(row, "mediaTypeName", "media_type_name", "typeLabel", "type_label") == null ? null : String(pick(row, "mediaTypeName", "media_type_name", "typeLabel", "type_label")),
    url: toStringValue(pick(row, "url", "fileUrl", "file_url"), ""),
    sortOrder: toNumber(pick(row, "sortOrder", "sort_order"), 1),
    altText: pick(row, "altText", "alt_text") == null ? null : String(pick(row, "altText", "alt_text")),
    isCover: toBoolean(pick(row, "isCover", "is_cover"), false),
    isActive: toBoolean(pick(row, "isActive", "is_active"), true),
    fileSizeBytes: toNullableNumber(pick(row, "fileSizeBytes", "file_size_bytes")),
    mimeType: pick(row, "mimeType", "mime_type") == null ? null : String(pick(row, "mimeType", "mime_type")),
    createdAt: pick(row, "createdAt", "created_at") == null ? null : String(pick(row, "createdAt", "created_at")),
    updatedAt: pick(row, "updatedAt", "updated_at") == null ? null : String(pick(row, "updatedAt", "updated_at")),
    ownerLabel,
  };
}
