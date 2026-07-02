import { AppError } from "@/lib/errors/app-error";
import { serviceRequest, serviceRequestOptional } from "@/lib/http/service-client";
import {
  asRecord,
  pick,
  toBoolean,
  toNullableNumber,
  toNumber,
  toStringValue,
  unwrapList,
  type AnyRecord,
} from "@/lib/http/service-data";
import { getCurrentPlanQuery } from "@/lib/db/queries/admin-company/billing";
import { getCompanyVerificationsQuery } from "@/lib/db/queries/admin-company/verifications";
import { validatePromotionFormInput } from "@/features/admin-company/promotions/schema";
import type {
  PromotionFormInput,
  PromotionGate,
  PromotionListFilters,
  PromotionListItem,
  PromotionListResult,
  PromotionRedemptionItem,
} from "@/features/admin-company/promotions/types";

type PaginatedPayload = {
  items?: unknown[];
  data?: unknown[];
  promotions?: unknown[];
  pagination?: unknown;
};

export async function getPromotionsOverviewQuery(
  companyId: number,
  filters: PromotionListFilters = {}
): Promise<{ promotions: PromotionListResult; gate: PromotionGate }> {
  const [promotions, gate] = await Promise.all([
    listPromotionsQuery(companyId, filters),
    getPromotionGateQuery(companyId),
  ]);

  return { promotions, gate };
}

export async function listPromotionsQuery(
  companyId: number,
  filters: PromotionListFilters = {}
): Promise<PromotionListResult> {
  const payload = await serviceRequest<PaginatedPayload | unknown[]>({
    service: "promotions",
    companyId,
    directPath: "/api/business/promotions",
    gatewayPath: "/api/promotions/api/business/promotions",
    query: {
      companyId,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
      search: filters.search?.trim() || undefined,
      branchId: filters.branchId,
      status: filters.status,
      active: filters.active,
    },
    errorCode: "PROMOTIONS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar la lista de promociones.",
  });

  const row = asRecord(payload);
  const items = unwrapList(payload, "items", "data", "promotions").map((item) =>
    normalizePromotion(item, companyId),
  );
  const pagination = asRecord(pick(row, "pagination", "meta"));

  return {
    items,
    pagination: {
      page: toNumber(pick(pagination, "page"), filters.page ?? 1),
      pageSize: toNumber(pick(pagination, "pageSize", "page_size"), filters.pageSize ?? 20),
      total: toNumber(pick(pagination, "total"), items.length),
      totalPages: toNumber(pick(pagination, "totalPages", "total_pages"), 1),
    },
  };
}

export async function createPromotionQuery(
  companyId: number,
  input: PromotionFormInput
): Promise<unknown> {
  const payload = validatePromotionFormInput(input);

  return serviceRequest<unknown, typeof payload>({
    service: "promotions",
    companyId,
    directPath: "/api/business/promotions",
    gatewayPath: "/api/promotions/api/business/promotions",
    method: "POST",
    body: payload,
    errorCode: "PROMOTION_CREATE_ERROR",
    errorMessage: "No se pudo crear la promoción.",
  });
}

export async function updatePromotionQuery(
  companyId: number,
  promotionId: number,
  input: PromotionFormInput
): Promise<unknown> {
  const payload = validatePromotionFormInput(input);

  return serviceRequest<unknown, Partial<typeof payload>>({
    service: "promotions",
    companyId,
    directPath: `/api/business/promotions/${promotionId}`,
    gatewayPath: `/api/promotions/api/business/promotions/${promotionId}`,
    method: "PATCH",
    body: payload,
    errorCode: "PROMOTION_UPDATE_ERROR",
    errorMessage: "No se pudo actualizar la promoción.",
  });
}

export async function activatePromotionQuery(companyId: number, promotionId: number) {
  return serviceRequest<unknown>({
    service: "promotions",
    companyId,
    directPath: `/api/business/promotions/${promotionId}/activate`,
    gatewayPath: `/api/promotions/api/business/promotions/${promotionId}/activate`,
    method: "PATCH",
    errorCode: "PROMOTION_ACTIVATE_ERROR",
    errorMessage: "No se pudo activar la promoción.",
  });
}

export async function pausePromotionQuery(companyId: number, promotionId: number) {
  return serviceRequest<unknown>({
    service: "promotions",
    companyId,
    directPath: `/api/business/promotions/${promotionId}/pause`,
    gatewayPath: `/api/promotions/api/business/promotions/${promotionId}/pause`,
    method: "PATCH",
    errorCode: "PROMOTION_PAUSE_ERROR",
    errorMessage: "No se pudo pausar la promoción.",
  });
}

export async function deletePromotionQuery(companyId: number, promotionId: number) {
  return serviceRequest<unknown>({
    service: "promotions",
    companyId,
    directPath: `/api/business/promotions/${promotionId}`,
    gatewayPath: `/api/promotions/api/business/promotions/${promotionId}`,
    method: "DELETE",
    errorCode: "PROMOTION_DELETE_ERROR",
    errorMessage: "No se pudo archivar la promoción.",
  });
}

export async function uploadPromotionCoverQuery(
  companyId: number,
  file: File,
  altText = "Portada de promoción"
): Promise<{ url: string }> {
  const mediaTypes = await serviceRequestOptional<unknown[]>({
    service: "media",
    companyId,
    directPath: "/api/media/types",
    gatewayPath: "/api/media/api/media/types",
  });

  const coverType = unwrapList(mediaTypes, "items", "data").find((item) => {
    const row = asRecord(item);
    const name = toStringValue(pick(row, "name", "code"), "").toLowerCase();
    return name.includes("cover") || name.includes("portada");
  });

  const mediaTypeId = toNumber(pick(asRecord(coverType), "id", "mediaTypeId", "media_type_id"), 2);
  const formData = new FormData();
  formData.set("file", file);
  formData.set("mediaTypeId", String(mediaTypeId));
  formData.set("isCover", "true");
  formData.set("altText", altText);

  const sessionMod = await import("@/lib/auth/session");
  const token = await sessionMod.getRawSessionToken();
  const session = await sessionMod.getSession();
  const { buildServiceUrl } = await import("@/lib/http/service-client");
  const url = buildServiceUrl({
    service: "media",
    directPath: `/api/media/companies/${companyId}`,
    gatewayPath: `/api/media/api/media/companies/${companyId}`,
  });

  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(session ? {
        "x-user-id": session.userId,
        "x-user-email": session.email,
        "x-user-role": session.role,
        "x-role-name": session.role,
        "x-user-permissions": [
          "media:types:read",
          "media:company:read",
          "media:company:write",
          "media:branch:read",
          "media:branch:write",
        ].join(","),
      } : {}),
      "x-company-id": String(companyId),
      "x-company-ids": String(companyId),
      "x-portal": "company",
    },
    body: formData,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorRow = asRecord(pick(asRecord(payload), "error"));
    throw new AppError(
      toStringValue(pick(errorRow, "code"), "MEDIA_UPLOAD_ERROR"),
      toStringValue(pick(errorRow, "message"), "No se pudo subir la portada."),
      response.status || 502,
    );
  }

  const data = asRecord(pick(asRecord(payload), "data") ?? payload);
  return { url: toStringValue(pick(data, "url"), "") };
}


export async function listPromotionRedemptionsQuery(
  companyId: number,
  promotionId: number
): Promise<PromotionRedemptionItem[]> {
  const payload = await serviceRequest<unknown>({
    service: "promotions",
    companyId,
    directPath: `/api/business/promotions/${promotionId}/redemptions`,
    gatewayPath: `/api/promotions/api/business/promotions/${promotionId}/redemptions`,
    errorCode: "PROMOTION_REDEMPTIONS_ERROR",
    errorMessage: "No se pudieron cargar las redenciones de la promoción.",
  });

  return unwrapList(payload, "items", "data", "redemptions").map((row) => ({
    redemptionId: toNumber(pick(row, "redemptionId", "redemption_id", "id")),
    promotionId: toNumber(pick(row, "promotionId", "promotion_id"), promotionId),
    userName: pick(row, "userName", "user_name") === undefined ? null : String(pick(row, "userName", "user_name")),
    userEmail: pick(row, "userEmail", "user_email") === undefined ? null : String(pick(row, "userEmail", "user_email")),
    redemptionCode: toStringValue(pick(row, "redemptionCode", "redemption_code"), ""),
    status: toStringValue(pick(row, "status", "statusCode", "status_code"), "unknown"),
    statusName: pick(row, "statusName", "status_name") === undefined ? null : String(pick(row, "statusName", "status_name")),
    issuedAt: pick(row, "issuedAt", "issued_at") === undefined ? null : String(pick(row, "issuedAt", "issued_at")),
    redeemedAt: pick(row, "redeemedAt", "redeemed_at") === undefined ? null : String(pick(row, "redeemedAt", "redeemed_at")),
    cancelledAt: pick(row, "cancelledAt", "cancelled_at") === undefined ? null : String(pick(row, "cancelledAt", "cancelled_at")),
    expiresAt: pick(row, "expiresAt", "expires_at") === undefined ? null : String(pick(row, "expiresAt", "expires_at")),
  }));
}

export async function getPromotionGateQuery(companyId: number): Promise<PromotionGate> {
  const [currentPlan, verification, promotions] = await Promise.all([
    getCurrentPlanQuery(companyId),
    getCompanyVerificationsQuery(companyId).catch(() => null),
    listPromotionsQuery(companyId, { page: 1, pageSize: 1, active: true }).catch(() => ({ items: [] } as PromotionListResult)),
  ]);

  const planAllowsPromotions = Boolean(currentPlan.features.promotions && (currentPlan.promotionLimit === null || currentPlan.promotionLimit > 0));
  const summary = verification?.summary;
  const verificationText = `${summary?.level ?? ""} ${summary?.statusLabel ?? ""}`.toLowerCase();
  const verifiedForPromotions = Boolean(
    summary &&
      (summary.score >= 50 ||
        summary.statusTone === "success" ||
        verificationText.includes("verificado") ||
        verificationText.includes("approved") ||
        verificationText.includes("aprob")),
  );

  const reasons: string[] = [];
  if (!planAllowsPromotions) reasons.push("Disponible desde el plan Pro.");
  if (!verifiedForPromotions) reasons.push("Requiere verificación de negocio o canal oficial.");

  return {
    planAllowsPromotions,
    verifiedForPromotions,
    canCreatePromotions: planAllowsPromotions && verifiedForPromotions,
    reasons,
    planLabel: currentPlan.planName,
    promotionLimit: currentPlan.promotionLimit,
    currentActivePromotions: promotions.pagination?.total ?? promotions.items.length,
    verificationLabel: summary?.statusLabel ?? "Sin verificación aprobada",
  };
}

function normalizePromotion(row: AnyRecord, fallbackCompanyId: number): PromotionListItem {
  return {
    promotionId: toNumber(pick(row, "promotionId", "promotion_id", "id")),
    title: toStringValue(pick(row, "title"), "Promoción"),
    description: pick(row, "description") === undefined || pick(row, "description") === null ? null : String(pick(row, "description")),
    terms: pick(row, "terms") === undefined || pick(row, "terms") === null ? null : String(pick(row, "terms")),
    discountPercent: toNullableNumber(pick(row, "discountPercent", "discount_percent")),
    startDate: pick(row, "startDate", "start_date") === undefined || pick(row, "startDate", "start_date") === null ? null : String(pick(row, "startDate", "start_date")),
    endDate: pick(row, "endDate", "end_date") === undefined || pick(row, "endDate", "end_date") === null ? null : String(pick(row, "endDate", "end_date")),
    active: toBoolean(pick(row, "active"), false),
    status: toStringValue(pick(row, "status", "statusCode", "status_code"), "draft"),
    statusName: pick(row, "statusName", "status_name") === undefined || pick(row, "statusName", "status_name") === null ? null : String(pick(row, "statusName", "status_name")),
    isPubliclyAvailable: toBoolean(pick(row, "isPubliclyAvailable", "is_publicly_available"), false),
    requiresStaffValidation: toBoolean(pick(row, "requiresStaffValidation", "requires_staff_validation"), true),
    coverUrl: pick(row, "coverUrl", "cover_url") === undefined || pick(row, "coverUrl", "cover_url") === null ? null : String(pick(row, "coverUrl", "cover_url")),
    branchId: toNumber(pick(row, "branchId", "branch_id")),
    branchName: toStringValue(pick(row, "branchName", "branch_name"), "Sucursal"),
    companyId: toNumber(pick(row, "companyId", "company_id"), fallbackCompanyId),
    companyName: toStringValue(pick(row, "companyName", "company_name"), "Negocio"),
    redemptionsTotal: toNumber(pick(row, "redemptionsTotal", "redemptions_total", "redeemedCount", "redeemed_count")),
    issuedCount: toNumber(pick(row, "issuedCount", "issued_count")),
    maxRedemptions: toNullableNumber(pick(row, "maxRedemptions", "max_redemptions")),
    maxRedemptionsPerUser: toNumber(pick(row, "maxRedemptionsPerUser", "max_redemptions_per_user"), 1),
  };
}
