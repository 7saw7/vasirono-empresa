import { AppError } from "@/lib/errors/app-error";
import { serviceRequest } from "@/lib/http/service-client";
import {
  asArray,
  asRecord,
  pick,
  toBoolean,
  toNullableNumber,
  toNumber,
  toStringValue,
  unwrapList,
  type AnyRecord,
} from "@/lib/http/service-data";
import {
  validateBranchDetail,
  validateBranchList,
  validateUpsertBranchInput,
} from "@/features/admin-company/branches/schema";
import type {
  BranchDetail,
  BranchDistrictOption,
  BranchListFilters,
  BranchListItem,
  UpsertBranchInput,
} from "@/features/admin-company/branches/types";

type BranchServicePayload = {
  items?: unknown[];
  branches?: unknown[];
  data?: unknown[];
};

export async function listBranchesQuery(
  companyId: number,
  filters: BranchListFilters = {}
) {
  const payload = await serviceRequest<BranchServicePayload | unknown[]>({
    service: "branch",
    directPath: "/api/company/branches",
    gatewayPath: "/api/branch/api/company/branches",
    query: {
      search: filters.search?.trim() || undefined,
      status: filters.status?.trim() || undefined,
      districtId: filters.districtId,
    },
    errorCode: "BRANCH_SERVICE_ERROR",
    errorMessage: "No se pudo cargar la lista de sucursales.",
  });

  const rows = unwrapList(payload, "items", "branches", "data");
  const branches = rows.map((row) => normalizeBranchListItem(row, companyId));

  return validateBranchList(branches);
}

export async function getBranchByIdQuery(companyId: number, branchId: number) {
  const payload = await serviceRequest<unknown>({
    service: "branch",
    directPath: `/api/company/branches/${branchId}`,
    gatewayPath: `/api/branch/api/company/branches/${branchId}`,
    errorCode: "BRANCH_SERVICE_ERROR",
    errorMessage: "No se pudo cargar la sucursal.",
  });

  const row = asRecord(payload);

  if (!Object.keys(row).length) {
    throw new AppError("NOT_FOUND", "Sucursal no encontrada.", 404);
  }

  return validateBranchDetail(normalizeBranchDetail(row, companyId, branchId));
}

export async function createBranchQuery(
  companyId: number,
  input: UpsertBranchInput
) {
  const payload = validateUpsertBranchInput(input);

  const created = await serviceRequest<unknown, UpsertBranchInput>({
    service: "branch",
    directPath: "/api/company/branches",
    gatewayPath: "/api/branch/api/company/branches",
    method: "POST",
    body: payload,
    errorCode: "BRANCH_SERVICE_ERROR",
    errorMessage: "No se pudo crear la sucursal.",
  });

  return validateBranchDetail(normalizeBranchDetail(asRecord(created), companyId));
}

export async function updateBranchQuery(
  companyId: number,
  branchId: number,
  input: UpsertBranchInput
) {
  const payload = validateUpsertBranchInput(input);

  const updated = await serviceRequest<unknown, UpsertBranchInput>({
    service: "branch",
    directPath: `/api/company/branches/${branchId}`,
    gatewayPath: `/api/branch/api/company/branches/${branchId}`,
    method: "PATCH",
    body: payload,
    errorCode: "BRANCH_SERVICE_ERROR",
    errorMessage: "No se pudo actualizar la sucursal.",
  });

  return validateBranchDetail(
    normalizeBranchDetail(asRecord(updated), companyId, branchId)
  );
}

export async function listBranchDistrictOptionsQuery(
  _companyId: number
): Promise<BranchDistrictOption[]> {
  const payload = await serviceRequest<unknown>({
    service: "branch",
    directPath: "/api/company/branches/district-options",
    gatewayPath: "/api/branch/api/company/branches/district-options",
    errorCode: "BRANCH_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el catálogo de distritos.",
  });

  return unwrapList(payload, "items", "districts", "data").map((row) => ({
    id: toNumber(pick(row, "id", "districtId", "district_id")),
    name: toStringValue(pick(row, "name", "districtName", "district_name"), "Sin distrito"),
  }));
}

function normalizeBranchListItem(
  row: AnyRecord,
  fallbackCompanyId: number
): BranchListItem {
  return {
    branchId: toNumber(pick(row, "branchId", "branch_id", "id")),
    companyId: toNumber(
      pick(row, "companyId", "company_id"),
      fallbackCompanyId
    ),
    name: toStringValue(pick(row, "name", "branchName", "branch_name"), "Sucursal"),
    description: toStringValue(pick(row, "description"), ""),
    address: toStringValue(pick(row, "address"), ""),
    phone: toStringValue(pick(row, "phone"), ""),
    email: toStringValue(pick(row, "email"), ""),
    districtId: toNullableNumber(pick(row, "districtId", "district_id")),
    districtName: toStringValue(
      pick(row, "districtName", "district_name", "district"),
      "Sin distrito"
    ),
    isMain: toBoolean(pick(row, "isMain", "is_main"), false),
    isActive: toBoolean(pick(row, "isActive", "is_active"), true),
    finalScore: toNullableNumber(pick(row, "finalScore", "final_score")),
    visits30d: toNullableNumber(pick(row, "visits30d", "visits_30d")),
    avgRating90d: toNullableNumber(
      pick(row, "avgRating90d", "avg_rating_90d")
    ),
  };
}

function normalizeBranchDetail(
  row: AnyRecord,
  fallbackCompanyId: number,
  fallbackBranchId?: number
): BranchDetail {
  const base = normalizeBranchListItem(
    { ...row, branchId: pick(row, "branchId", "branch_id", "id") ?? fallbackBranchId },
    fallbackCompanyId
  );

  return {
    ...base,
    lat: toNullableNumber(pick(row, "lat", "latitude")),
    lon: toNullableNumber(pick(row, "lon", "lng", "longitude")),
    schedules: asArray(pick(row, "schedules", "schedule")).map((item) => ({
      scheduleId: toNumber(pick(item, "scheduleId", "schedule_id", "id")),
      dayName: toStringValue(pick(item, "dayName", "day_name", "day"), "Día"),
      opening:
        toStringValue(pick(item, "opening", "openTime", "opening_time"), "") ||
        null,
      closing:
        toStringValue(pick(item, "closing", "closeTime", "closing_time"), "") ||
        null,
      shiftNumber: toNumber(pick(item, "shiftNumber", "shift_number"), 1),
    })),
    services: asArray(pick(row, "services")).map((item) => ({
      serviceId: toNumber(pick(item, "serviceId", "service_id", "id")),
      code: toStringValue(pick(item, "code"), ""),
      name: toStringValue(pick(item, "name", "label"), "Servicio"),
      isAvailable: toBoolean(pick(item, "isAvailable", "is_available"), true),
    })),
    contacts: asArray(pick(row, "contacts")).map((item) => ({
      contactId: toNumber(pick(item, "contactId", "contact_id", "id")),
      typeLabel: toStringValue(
        pick(item, "typeLabel", "type_label", "type"),
        "Contacto"
      ),
      value: toStringValue(pick(item, "value"), ""),
      label: toStringValue(pick(item, "label"), "") || null,
      isPrimary: toBoolean(pick(item, "isPrimary", "is_primary"), false),
      isPublic: toBoolean(pick(item, "isPublic", "is_public"), true),
    })),
    media: asArray(pick(row, "media", "images")).map((item) => ({
      mediaId: toNumber(pick(item, "mediaId", "media_id", "id")),
      typeLabel: toStringValue(
        pick(item, "typeLabel", "type_label", "type"),
        "Imagen"
      ),
      url: toStringValue(pick(item, "url", "fileUrl", "file_url"), ""),
    })),
  };
}
