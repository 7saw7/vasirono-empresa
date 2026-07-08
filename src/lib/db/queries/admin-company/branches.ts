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

function optionalString(value: string | undefined | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeUpsertBranchPayload(input: UpsertBranchInput) {
  return {
    name: input.name.trim(),
    description: optionalString(input.description),
    address: input.address.trim(),
    phone: optionalString(input.phone),
    email: optionalString(input.email),
    districtId: input.districtId,
    isMain: input.isMain,
    isActive: input.isActive,
  };
}

export async function listBranchesQuery(
  companyId: number,
  filters: BranchListFilters = {}
) {
  const payload = await serviceRequest<BranchServicePayload | unknown[]>({
    service: "branch",
    companyId,
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
    companyId,
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
  const payload = sanitizeUpsertBranchPayload(validateUpsertBranchInput(input));

  const created = await serviceRequest<unknown, ReturnType<typeof sanitizeUpsertBranchPayload>>({
    service: "branch",
    companyId,
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
  const payload = sanitizeUpsertBranchPayload(validateUpsertBranchInput(input));

  const updated = await serviceRequest<unknown, ReturnType<typeof sanitizeUpsertBranchPayload>>({
    service: "branch",
    companyId,
    directPath: `/api/company/branches/${branchId}`,
    gatewayPath: `/api/branch/api/company/branches/${branchId}`,
    method: "PUT",
    body: payload,
    errorCode: "BRANCH_SERVICE_ERROR",
    errorMessage: "No se pudo actualizar la sucursal.",
  });

  return validateBranchDetail(
    normalizeBranchDetail(asRecord(updated), companyId, branchId)
  );
}

export async function listBranchDistrictOptionsQuery(
  companyId: number
): Promise<BranchDistrictOption[]> {
  try {
    const payload = await serviceRequest<unknown>({
      service: "branch",
      companyId,
      directPath: "/api/company/branches/district-options",
      gatewayPath: "/api/branch/api/company/branches/district-options",
      errorCode: "BRANCH_SERVICE_ERROR",
      errorMessage: "No se pudo cargar el catálogo de distritos.",
    });

    return unwrapList(payload, "items", "districts", "data").map(normalizeDistrictOption);
  } catch {
    const payload = await serviceRequest<unknown>({
      service: "locations",
      companyId,
      directPath: "/api/locations/districts",
      gatewayPath: "/api/locations/api/locations/districts",
      errorCode: "LOCATIONS_SERVICE_ERROR",
      errorMessage: "No se pudo cargar el catálogo de distritos.",
    });

    return unwrapList(payload, "items", "districts", "data").map(normalizeDistrictOption);
  }
}

function normalizeDistrictOption(row: AnyRecord): BranchDistrictOption {
  return {
    id: toNumber(pick(row, "id", "districtId", "district_id")),
    name: toStringValue(pick(row, "name", "districtName", "district_name"), "Sin distrito"),
  };
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
    reviews90d: toNullableNumber(pick(row, "reviews90d", "reviews_90d")),
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


export type BranchServiceCatalogItem = {
  serviceId: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
};

export type BranchHourExceptionItem = {
  exceptionId: number;
  exceptionDate: string;
  isClosed: boolean;
  opening: string | null;
  closing: string | null;
  reason: string | null;
  notes: string | null;
};

export async function listBranchContactsQuery(companyId: number, branchId: number) {
  const payload = await serviceRequest<unknown>({
    service: "branch",
    companyId,
    directPath: `/api/company/branches/${branchId}/contacts`,
    gatewayPath: `/api/branch/api/company/branches/${branchId}/contacts`,
    errorCode: "BRANCH_CONTACTS_ERROR",
    errorMessage: "No se pudo cargar los contactos.",
  });
  return unwrapList(payload, "items", "data", "contacts").map((item) => ({
    contactId: toNumber(pick(item, "contactId", "contact_id", "id")),
    typeLabel: toStringValue(pick(item, "contactTypeName", "typeLabel", "type_label", "type"), "Contacto"),
    value: toStringValue(pick(item, "value"), ""),
    label: toStringValue(pick(item, "label"), "") || null,
    isPrimary: toBoolean(pick(item, "isPrimary", "is_primary"), false),
    isPublic: toBoolean(pick(item, "isPublic", "is_public"), true),
  }));
}

export async function createBranchContactQuery(companyId: number, branchId: number, body: unknown) {
  return serviceRequest<unknown, unknown>({
    service: "branch",
    companyId,
    directPath: `/api/company/branches/${branchId}/contacts`,
    gatewayPath: `/api/branch/api/company/branches/${branchId}/contacts`,
    method: "POST",
    body,
    errorCode: "BRANCH_CONTACT_CREATE_ERROR",
    errorMessage: "No se pudo crear el contacto.",
  });
}

export async function updateBranchContactQuery(companyId: number, branchId: number, contactId: number, body: unknown) {
  return serviceRequest<unknown, unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/contacts/${contactId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/contacts/${contactId}`, method: "PUT", body, errorCode: "BRANCH_CONTACT_UPDATE_ERROR", errorMessage: "No se pudo actualizar el contacto." });
}

export async function deleteBranchContactQuery(companyId: number, branchId: number, contactId: number) {
  return serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/contacts/${contactId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/contacts/${contactId}`, method: "DELETE", errorCode: "BRANCH_CONTACT_DELETE_ERROR", errorMessage: "No se pudo eliminar el contacto." });
}

export async function setPrimaryBranchContactQuery(companyId: number, branchId: number, contactId: number) {
  return serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/contacts/${contactId}/set-primary`, gatewayPath: `/api/branch/api/company/branches/${branchId}/contacts/${contactId}/set-primary`, method: "PATCH", errorCode: "BRANCH_CONTACT_PRIMARY_ERROR", errorMessage: "No se pudo marcar el contacto como principal." });
}

export async function listBranchSchedulesQuery(companyId: number, branchId: number) {
  const payload = await serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/schedules`, gatewayPath: `/api/branch/api/company/branches/${branchId}/schedules`, errorCode: "BRANCH_SCHEDULES_ERROR", errorMessage: "No se pudo cargar horarios." });
  return unwrapList(payload, "items", "data", "schedules").map((item) => ({
    scheduleId: toNumber(pick(item, "scheduleId", "schedule_id", "id")),
    dayName: toStringValue(pick(item, "dayName", "day_name", "day"), "Día"),
    isoNumber: toNumber(pick(item, "isoNumber", "iso_number")),
    opening: toStringValue(pick(item, "opening"), "") || null,
    closing: toStringValue(pick(item, "closing"), "") || null,
    shiftNumber: toNumber(pick(item, "shiftNumber", "shift_number"), 1),
  }));
}

export async function upsertBranchScheduleQuery(companyId: number, branchId: number, body: unknown) {
  return serviceRequest<unknown, unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/schedules`, gatewayPath: `/api/branch/api/company/branches/${branchId}/schedules`, method: "POST", body, errorCode: "BRANCH_SCHEDULE_UPSERT_ERROR", errorMessage: "No se pudo guardar el horario." });
}

export async function deleteBranchScheduleQuery(companyId: number, branchId: number, scheduleId: number) {
  return serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/schedules/${scheduleId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/schedules/${scheduleId}`, method: "DELETE", errorCode: "BRANCH_SCHEDULE_DELETE_ERROR", errorMessage: "No se pudo eliminar el horario." });
}

export async function listBranchHourExceptionsQuery(companyId: number, branchId: number): Promise<BranchHourExceptionItem[]> {
  const payload = await serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/hour-exceptions`, gatewayPath: `/api/branch/api/company/branches/${branchId}/hour-exceptions`, errorCode: "BRANCH_EXCEPTIONS_ERROR", errorMessage: "No se pudo cargar excepciones de horario." });
  return unwrapList(payload, "items", "data", "exceptions").map((item) => ({
    exceptionId: toNumber(pick(item, "exceptionId", "exception_id", "id")),
    exceptionDate: toStringValue(pick(item, "exceptionDate", "exception_date"), ""),
    isClosed: toBoolean(pick(item, "isClosed", "is_closed"), false),
    opening: toStringValue(pick(item, "opening"), "") || null,
    closing: toStringValue(pick(item, "closing"), "") || null,
    reason: toStringValue(pick(item, "reason"), "") || null,
    notes: toStringValue(pick(item, "notes"), "") || null,
  }));
}

export async function createBranchHourExceptionQuery(companyId: number, branchId: number, body: unknown) {
  return serviceRequest<unknown, unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/hour-exceptions`, gatewayPath: `/api/branch/api/company/branches/${branchId}/hour-exceptions`, method: "POST", body, errorCode: "BRANCH_EXCEPTION_CREATE_ERROR", errorMessage: "No se pudo crear la excepción." });
}

export async function updateBranchHourExceptionQuery(companyId: number, branchId: number, exceptionId: number, body: unknown) {
  return serviceRequest<unknown, unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/hour-exceptions/${exceptionId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/hour-exceptions/${exceptionId}`, method: "PUT", body, errorCode: "BRANCH_EXCEPTION_UPDATE_ERROR", errorMessage: "No se pudo actualizar la excepción." });
}

export async function deleteBranchHourExceptionQuery(companyId: number, branchId: number, exceptionId: number) {
  return serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/hour-exceptions/${exceptionId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/hour-exceptions/${exceptionId}`, method: "DELETE", errorCode: "BRANCH_EXCEPTION_DELETE_ERROR", errorMessage: "No se pudo eliminar la excepción." });
}

export async function listServiceCatalogQuery(companyId: number): Promise<BranchServiceCatalogItem[]> {
  const payload = await serviceRequest<unknown>({ service: "branch", companyId, directPath: "/api/company/branches/service-catalog", gatewayPath: "/api/branch/api/company/branches/service-catalog", errorCode: "SERVICE_CATALOG_ERROR", errorMessage: "No se pudo cargar el catálogo de servicios." });
  return unwrapList(payload, "items", "data", "services").map((item) => ({
    serviceId: toNumber(pick(item, "serviceId", "service_id", "id")),
    code: toStringValue(pick(item, "code"), ""),
    name: toStringValue(pick(item, "name"), "Servicio"),
    description: toStringValue(pick(item, "description"), "") || null,
    icon: toStringValue(pick(item, "icon"), "") || null,
    isActive: toBoolean(pick(item, "isActive", "is_active"), true),
  }));
}

export async function attachBranchServiceQuery(companyId: number, branchId: number, body: unknown) {
  return serviceRequest<unknown, unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/services`, gatewayPath: `/api/branch/api/company/branches/${branchId}/services`, method: "POST", body, errorCode: "BRANCH_SERVICE_ATTACH_ERROR", errorMessage: "No se pudo asociar el servicio." });
}

export async function updateBranchServiceAvailabilityQuery(companyId: number, branchId: number, serviceId: number, isAvailable: boolean) {
  return serviceRequest<unknown, { isAvailable: boolean }>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/services/${serviceId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/services/${serviceId}`, method: "PATCH", body: { isAvailable }, errorCode: "BRANCH_SERVICE_UPDATE_ERROR", errorMessage: "No se pudo actualizar disponibilidad." });
}

export async function detachBranchServiceQuery(companyId: number, branchId: number, serviceId: number) {
  return serviceRequest<unknown>({ service: "branch", companyId, directPath: `/api/company/branches/${branchId}/services/${serviceId}`, gatewayPath: `/api/branch/api/company/branches/${branchId}/services/${serviceId}`, method: "DELETE", errorCode: "BRANCH_SERVICE_DETACH_ERROR", errorMessage: "No se pudo quitar el servicio." });
}
