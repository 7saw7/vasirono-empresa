import { AppError } from "@/lib/errors/app-error";
import { serviceRequest, buildServiceUrl } from "@/lib/http/service-client";
import { asRecord, pick, toBoolean, toNullableNumber, toNumber, toStringValue, unwrapList, type AnyRecord } from "@/lib/http/service-data";
import { getRawSessionToken, getSession } from "@/lib/auth/session";
import type { GalleryMediaItem, GalleryOverview, MediaOwnerType, MediaTypeOption } from "@/features/admin-company/media/types";

export async function getGalleryOverviewQuery(companyId: number): Promise<GalleryOverview> {
  const payload = await serviceRequest<unknown>({
    service: "media",
    companyId,
    directPath: `/api/media/business/companies/${companyId}/gallery`,
    gatewayPath: `/api/media/api/media/business/companies/${companyId}/gallery`,
    errorCode: "GALLERY_OVERVIEW_ERROR",
    errorMessage: "No se pudo cargar la galería ni validar el límite del plan.",
  });

  const root = asRecord(payload);
  const usage = asRecord(pick(root, "usage"));
  const branches = unwrapList(root, "branches").map((row) => ({
    branchId: toNumber(pick(row, "branchId", "branch_id")),
    name: toStringValue(pick(row, "name"), "Sucursal"),
  }));
  const branchNameById = new Map(branches.map((branch) => [branch.branchId, branch.name]));

  return {
    mediaTypes: unwrapList(root, "mediaTypes", "media_types").map((row) => ({
      id: toNumber(pick(row, "id", "mediaTypeId", "media_type_id")),
      name: toStringValue(pick(row, "name", "code"), "gallery"),
      isUnique: toBoolean(pick(row, "isUnique", "is_unique"), false),
    })),
    companyMedia: unwrapList(root, "companyMedia", "company_media").map((row) =>
      normalizeMedia(row, "company", companyId, "Negocio"),
    ),
    branchMedia: unwrapList(root, "branchMedia", "branch_media").map((row) => {
      const ownerId = toNumber(pick(row, "ownerId", "owner_id", "branchId", "branch_id"));
      return normalizeMedia(
        row,
        "branch",
        ownerId,
        toStringValue(pick(row, "ownerLabel", "owner_label"), branchNameById.get(ownerId) ?? "Sucursal"),
      );
    }),
    branches,
    planLimit: toNullableNumber(pick(usage, "limit")),
    usedMedia: toNumber(pick(usage, "used"), 0),
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

  const body: { altText?: string | null; isActive?: boolean } = {};
  if (Object.prototype.hasOwnProperty.call(input, "altText")) body.altText = input.altText ?? null;
  if (typeof input.isActive === "boolean") body.isActive = input.isActive;

  const payload = await serviceRequest<unknown, typeof body>({
    service: "media",
    companyId,
    directPath,
    gatewayPath,
    method: "PATCH",
    body,
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


export async function reorderBranchMediaQuery(
  companyId: number,
  branchId: number,
  items: Array<{ mediaId: number; sortOrder: number }>,
): Promise<unknown> {
  return serviceRequest<unknown, { items: Array<{ mediaId: number; sortOrder: number }> }>({
    service: "media",
    companyId,
    directPath: `/api/media/branches/${branchId}/reorder`,
    gatewayPath: `/api/media/api/media/branches/${branchId}/reorder`,
    method: "PATCH",
    body: { items },
    errorCode: "MEDIA_REORDER_ERROR",
    errorMessage: "No se pudo ordenar las imágenes.",
  });
}

export async function reorderCompanyMediaQuery(
  companyId: number,
  items: Array<{ mediaId: number; sortOrder: number }>,
): Promise<unknown> {
  return serviceRequest<unknown, { items: Array<{ mediaId: number; sortOrder: number }> }>({
    service: "media",
    companyId,
    directPath: `/api/media/companies/${companyId}/reorder`,
    gatewayPath: `/api/media/api/media/companies/${companyId}/reorder`,
    method: "PATCH",
    body: { items },
    errorCode: "MEDIA_REORDER_ERROR",
    errorMessage: "No se pudo ordenar las imágenes del negocio.",
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
