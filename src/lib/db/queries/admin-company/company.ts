import { serviceRequest } from "@/lib/http/service-client";
import {
  asArray,
  asRecord,
  pick,
  toBoolean,
  toNumber,
  toStringValue,
  type AnyRecord,
} from "@/lib/http/service-data";
import {
  validateCompanyProfile,
  validateUpdateCompanyProfileInput,
} from "@/features/admin-company/company/schema";
import type {
  CompanyCategoryItem,
  CompanyContactItem,
  CompanyMediaItem,
  CompanyProfile,
  UpdateCompanyProfileInput,
} from "@/features/admin-company/company/types";

export async function getCompanyProfileQuery(companyId: number) {
  const payload = await serviceRequest<unknown>({
    service: "companies",
    companyId,
    directPath: "/api/companies/me/profile",
    gatewayPath: "/api/companies/api/companies/me/profile",
    errorCode: "COMPANIES_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el perfil del negocio.",
  });

  return validateCompanyProfile(normalizeCompanyProfile(asRecord(payload), companyId));
}

export async function updateCompanyProfileQuery(
  companyId: number,
  input: UpdateCompanyProfileInput
) {
  const payload = validateUpdateCompanyProfileInput(input);

  const updated = await serviceRequest<unknown, UpdateCompanyProfileInput>({
    service: "companies",
    companyId,
    directPath: "/api/companies/me/profile",
    gatewayPath: "/api/companies/api/companies/me/profile",
    method: "PATCH",
    body: payload,
    errorCode: "COMPANIES_SERVICE_ERROR",
    errorMessage: "No se pudo actualizar el perfil del negocio.",
  });

  return validateCompanyProfile(normalizeCompanyProfile(asRecord(updated), companyId));
}

function normalizeCompanyProfile(row: AnyRecord, fallbackCompanyId: number): CompanyProfile {
  const verificationStatus = pick(row, "verificationStatus", "verification_status");
  const priceRange = asRecord(pick(row, "priceRange", "price_range"));

  return {
    companyId: toNumber(pick(row, "companyId", "company_id", "id"), fallbackCompanyId),
    name: toStringValue(pick(row, "name", "companyName", "company_name"), "Mi negocio"),
    description: toStringValue(pick(row, "description"), ""),
    address: toStringValue(pick(row, "address"), ""),
    phone: toStringValue(pick(row, "phone"), ""),
    email: toStringValue(pick(row, "email"), ""),
    website: toStringValue(pick(row, "website", "websiteUrl", "website_url"), ""),
    verificationStatus:
      typeof verificationStatus === "object"
        ? toStringValue(
            pick(asRecord(verificationStatus), "name", "label", "statusLabel", "status_label"),
            "Pendiente"
          )
        : toStringValue(verificationStatus, "Pendiente"),
    priceLabel: toStringValue(
      pick(row, "priceLabel", "price_label") ?? pick(priceRange, "name", "label"),
      ""
    ) || null,
    media: normalizeMedia(row),
    contacts: normalizeContacts(row),
    categories: normalizeCategories(row),
  };
}

function normalizeMedia(row: AnyRecord): CompanyMediaItem[] {
  const media = asArray(pick(row, "media", "images"));

  const normalized = media
    .map((item) => ({
      id: toNumber(pick(item, "id", "mediaId", "media_id")),
      url: toStringValue(pick(item, "url", "fileUrl", "file_url"), ""),
      typeLabel: toStringValue(pick(item, "typeLabel", "type_label", "type"), "Imagen"),
    }))
    .filter((item) => item.url);

  const logoUrl = toStringValue(pick(row, "logoUrl", "logo_url"), "");
  const coverUrl = toStringValue(pick(row, "coverUrl", "cover_url"), "");

  if (logoUrl && !normalized.some((item) => item.url === logoUrl)) {
    normalized.push({ id: 0, url: logoUrl, typeLabel: "Logo" });
  }

  if (coverUrl && !normalized.some((item) => item.url === coverUrl)) {
    normalized.push({ id: 0, url: coverUrl, typeLabel: "Portada" });
  }

  return normalized;
}

function normalizeContacts(row: AnyRecord): CompanyContactItem[] {
  const contacts = asArray(pick(row, "contacts")).map((item) => ({
    id: toNumber(pick(item, "id", "contactId", "contact_id")),
    typeLabel: toStringValue(pick(item, "typeLabel", "type_label", "type"), "Contacto"),
    value: toStringValue(pick(item, "value"), ""),
    isPrimary: toBoolean(pick(item, "isPrimary", "is_primary"), false),
    isPublic: toBoolean(pick(item, "isPublic", "is_public"), true),
  }));

  const phone = toStringValue(pick(row, "phone"), "");
  const email = toStringValue(pick(row, "email"), "");
  const website = toStringValue(pick(row, "website", "websiteUrl", "website_url"), "");

  if (phone) contacts.push({ id: 0, typeLabel: "Teléfono", value: phone, isPrimary: true, isPublic: true });
  if (email) contacts.push({ id: 0, typeLabel: "Correo", value: email, isPrimary: !phone, isPublic: true });
  if (website) contacts.push({ id: 0, typeLabel: "Web", value: website, isPrimary: false, isPublic: true });

  return contacts.filter((item, index, items) =>
    item.value && items.findIndex((candidate) => candidate.value === item.value) === index
  );
}

function normalizeCategories(row: AnyRecord): CompanyCategoryItem[] {
  return asArray(pick(row, "categories", "subcategories", "taxonomy")).map((item) => ({
    subcategoryId: toNumber(pick(item, "subcategoryId", "subcategory_id", "id")),
    subcategoryName: toStringValue(
      pick(item, "subcategoryName", "subcategory_name", "name"),
      "Categoría"
    ),
    categoryName: toStringValue(pick(item, "categoryName", "category_name"), ""),
    priceLabel: toStringValue(pick(item, "priceLabel", "price_label"), "") || null,
  }));
}
