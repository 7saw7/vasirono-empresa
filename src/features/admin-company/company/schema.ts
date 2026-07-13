import { AppError } from "@/lib/errors/app-error";
import type {
  CompanyCategoryItem,
  CompanyProfile,
  CompanyTaxonomy,
  UpdateCompanyProfileInput,
  UpdateCompanyTaxonomyInput,
} from "./types";

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isNullableFiniteNumber(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function validateUpdateCompanyProfileInput(
  input: unknown
): UpdateCompanyProfileInput {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "El payload del perfil del negocio es inválido.",
      422
    );
  }

  const data = input as Record<string, unknown>;
  const lat = parseNullableNumber(data.lat);
  const lon = parseNullableNumber(data.lon);
  const rawPriceId = parseNullableNumber(data.priceId);

  const parsed: UpdateCompanyProfileInput = {
    name: String(data.name ?? "").trim(),
    description: String(data.description ?? "").trim(),
    address: String(data.address ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    email: String(data.email ?? "").trim(),
    website: String(data.website ?? "").trim(),
    lat,
    lon,
    priceId: rawPriceId,
  };

  const errors: Record<string, string[]> = {};

  if (parsed.name.length < 2 || parsed.name.length > 160) {
    errors.name = ["El nombre debe tener entre 2 y 160 caracteres."];
  }
  if (parsed.description.length > 1500) {
    errors.description = ["La descripción no puede superar 1500 caracteres."];
  }
  if (parsed.address.length > 220) {
    errors.address = ["La dirección no puede superar 220 caracteres."];
  }
  if (parsed.phone.length > 40) {
    errors.phone = ["El teléfono no puede superar 40 caracteres."];
  }
  if (parsed.email.length > 160) {
    errors.email = ["El correo no puede superar 160 caracteres."];
  } else if (parsed.email && !isValidEmail(parsed.email)) {
    errors.email = ["El correo no tiene un formato válido."];
  }
  if (parsed.website.length > 220) {
    errors.website = ["El sitio web no puede superar 220 caracteres."];
  } else if (parsed.website && !isValidUrl(parsed.website)) {
    errors.website = ["El sitio web debe comenzar con http:// o https://."];
  }
  if (!isNullableFiniteNumber(parsed.lat) || (parsed.lat !== null && (parsed.lat < -90 || parsed.lat > 90))) {
    errors.lat = ["La latitud debe estar entre -90 y 90."];
  }
  if (!isNullableFiniteNumber(parsed.lon) || (parsed.lon !== null && (parsed.lon < -180 || parsed.lon > 180))) {
    errors.lon = ["La longitud debe estar entre -180 y 180."];
  }
  if (
    parsed.priceId !== null &&
    (!Number.isInteger(parsed.priceId) || parsed.priceId <= 0)
  ) {
    errors.priceId = ["El rango de precio seleccionado es inválido."];
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Datos inválidos para actualizar el perfil del negocio.",
      422,
      errors
    );
  }

  return parsed;
}

export function validateUpdateCompanyTaxonomyInput(
  input: unknown
): UpdateCompanyTaxonomyInput {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "La clasificación enviada no es válida.",
      422
    );
  }

  const data = input as Record<string, unknown>;
  const businessTypeIds = Array.isArray(data.businessTypeIds)
    ? data.businessTypeIds.map(Number)
    : [];
  const subcategories = Array.isArray(data.subcategories)
    ? data.subcategories.map((item) => {
        const row = item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
        const rawPriceId = row.priceId;
        return {
          subcategoryId: Number(row.subcategoryId),
          priceId:
            rawPriceId === null || rawPriceId === undefined || rawPriceId === ""
              ? null
              : Number(rawPriceId),
        };
      })
    : [];

  const invalidBusinessType = businessTypeIds.some(
    (id) => !Number.isInteger(id) || id <= 0
  );
  const invalidSubcategory = subcategories.some(
    (item) =>
      !Number.isInteger(item.subcategoryId) ||
      item.subcategoryId <= 0 ||
      (item.priceId !== null &&
        (!Number.isInteger(item.priceId) || item.priceId <= 0))
  );

  if (invalidBusinessType || invalidSubcategory) {
    throw new AppError(
      "VALIDATION_ERROR",
      "La clasificación contiene identificadores inválidos.",
      422
    );
  }

  return {
    businessTypeIds: [...new Set(businessTypeIds)],
    subcategories: Array.from(
      new Map(
        subcategories.map((item) => [item.subcategoryId, item] as const)
      ).values()
    ),
  };
}


function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isValidTaxonomyCatalog(data: CompanyTaxonomy) {
  return (
    data.businessTypes.every(
      (item) => isPositiveInteger(item.typeId) && isNonEmptyString(item.name)
    ) &&
    data.categories.every(
      (item) => isPositiveInteger(item.categoryId) && isNonEmptyString(item.name)
    ) &&
    data.subcategories.every(
      (item) =>
        isPositiveInteger(item.subcategoryId) &&
        isPositiveInteger(item.categoryId) &&
        isNonEmptyString(item.name)
    ) &&
    data.priceRanges.every(
      (item) =>
        isPositiveInteger(item.priceId) &&
        isNonEmptyString(item.label) &&
        isNullableFiniteNumber(item.minValue) &&
        isNullableFiniteNumber(item.maxValue)
    ) &&
    data.selectedBusinessTypeIds.every(isPositiveInteger)
  );
}

function isValidCategory(item: unknown): item is CompanyCategoryItem {
  if (!item || typeof item !== "object") return false;
  const row = item as CompanyCategoryItem;
  return (
    Number.isInteger(row.subcategoryId) &&
    row.subcategoryId > 0 &&
    Number.isInteger(row.categoryId) &&
    row.categoryId > 0 &&
    isNonEmptyString(row.subcategoryName) &&
    isNonEmptyString(row.categoryName) &&
    (row.priceId === null || (Number.isInteger(row.priceId) && row.priceId > 0)) &&
    (row.priceLabel === null || typeof row.priceLabel === "string")
  );
}

export function validateCompanyTaxonomy(input: unknown): CompanyTaxonomy {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "La clasificación del negocio recibida no es válida.",
      422
    );
  }

  const data = input as CompanyTaxonomy;
  if (
    !Array.isArray(data.businessTypes) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.subcategories) ||
    !Array.isArray(data.priceRanges) ||
    !Array.isArray(data.selectedBusinessTypeIds) ||
    !Array.isArray(data.selectedSubcategories) ||
    !isValidTaxonomyCatalog(data) ||
    !data.selectedSubcategories.every(isValidCategory)
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "La clasificación no cumple el contrato esperado.",
      422
    );
  }

  return data;
}

export function validateCompanyProfile(input: unknown): CompanyProfile {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "El perfil del negocio recibido no es válido.",
      422
    );
  }

  const data = input as CompanyProfile;

  if (
    !Number.isInteger(data.companyId) ||
    data.companyId <= 0 ||
    !isNonEmptyString(data.name) ||
    typeof data.description !== "string" ||
    typeof data.address !== "string" ||
    typeof data.phone !== "string" ||
    typeof data.email !== "string" ||
    typeof data.website !== "string" ||
    !isNullableFiniteNumber(data.lat) ||
    !isNullableFiniteNumber(data.lon) ||
    typeof data.verificationStatus !== "string" ||
    (data.priceId !== null && (!Number.isInteger(data.priceId) || data.priceId <= 0)) ||
    (data.priceLabel !== null && typeof data.priceLabel !== "string") ||
    !Array.isArray(data.media) ||
    !data.media.every(
      (item) =>
        Number.isInteger(item.id) &&
        item.id !== 0 &&
        isNonEmptyString(item.url) &&
        isNonEmptyString(item.typeLabel) &&
        (item.altText === null || typeof item.altText === "string") &&
        typeof item.isCover === "boolean" &&
        typeof item.isActive === "boolean" &&
        Number.isInteger(item.sortOrder)
    ) ||
    !Array.isArray(data.contacts) ||
    !data.contacts.every(
      (item) =>
        isNonEmptyString(item.id) &&
        isNonEmptyString(item.typeLabel) &&
        isNonEmptyString(item.value)
    ) ||
    !Array.isArray(data.categories) ||
    !data.categories.every(isValidCategory)
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "El perfil del negocio no cumple el contrato esperado.",
      422
    );
  }

  validateCompanyTaxonomy(data.taxonomy);
  return data;
}
