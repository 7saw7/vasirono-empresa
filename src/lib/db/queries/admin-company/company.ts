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
  validateCompanyProfile,
  validateCompanyTaxonomy,
  validateUpdateCompanyProfileInput,
  validateUpdateCompanyTaxonomyInput,
} from "@/features/admin-company/company/schema";
import type {
  CompanyCategoryItem,
  CompanyContactItem,
  CompanyMediaItem,
  CompanyProfile,
  CompanyTaxonomy,
  UpdateCompanyProfileInput,
  UpdateCompanyTaxonomyInput,
} from "@/features/admin-company/company/types";

export async function getCompanyProfileQuery(
  companyId: number
): Promise<CompanyProfile> {
  const [profilePayload, taxonomy, mediaPayload] = await Promise.all([
    serviceRequest<unknown>({
      service: "companies",
      companyId,
      directPath: "/api/companies/me/profile",
      gatewayPath: "/api/companies/api/companies/me/profile",
      errorCode: "COMPANIES_SERVICE_ERROR",
      errorMessage: "No se pudo cargar el perfil del negocio.",
    }),
    getCompanyTaxonomyQuery(companyId),
    serviceRequest<unknown>({
      service: "media",
      companyId,
      directPath: `/api/media/companies/${companyId}`,
      gatewayPath: `/api/media/api/media/companies/${companyId}`,
      errorCode: "COMPANY_MEDIA_ERROR",
      errorMessage: "No se pudo cargar la media del negocio.",
    }),
  ]);

  return validateCompanyProfile(
    normalizeCompanyProfile(
      asRecord(profilePayload),
      taxonomy,
      unwrapList(mediaPayload, "items", "data", "media"),
      companyId
    )
  );
}

export async function updateCompanyProfileQuery(
  companyId: number,
  input: UpdateCompanyProfileInput
): Promise<CompanyProfile> {
  const payload = validateUpdateCompanyProfileInput(input);

  await serviceRequest<unknown, Record<string, unknown>>({
    service: "companies",
    companyId,
    directPath: "/api/companies/me/profile",
    gatewayPath: "/api/companies/api/companies/me/profile",
    method: "PATCH",
    body: {
      name: payload.name,
      description: payload.description || null,
      address: payload.address || null,
      phone: payload.phone || null,
      email: payload.email || null,
      website: payload.website || null,
      lat: payload.lat,
      lon: payload.lon,
      priceId: payload.priceId,
    },
    errorCode: "COMPANIES_SERVICE_ERROR",
    errorMessage: "No se pudo actualizar el perfil del negocio.",
  });

  // Siempre se vuelve a consultar el agregado completo para que el cliente
  // reciba perfil, taxonomía y media con un único contrato consistente.
  return getCompanyProfileQuery(companyId);
}

export async function getCompanyTaxonomyQuery(
  companyId: number
): Promise<CompanyTaxonomy> {
  const payload = await serviceRequest<unknown>({
    service: "companies",
    companyId,
    directPath: "/api/companies/me/settings",
    gatewayPath: "/api/companies/api/companies/me/settings",
    errorCode: "COMPANY_TAXONOMY_ERROR",
    errorMessage: "No se pudo cargar la clasificación del negocio.",
  });

  return validateCompanyTaxonomy(normalizeCompanyTaxonomy(asRecord(payload)));
}

export async function updateCompanyTaxonomyQuery(
  companyId: number,
  input: UpdateCompanyTaxonomyInput
): Promise<CompanyTaxonomy> {
  const payload = validateUpdateCompanyTaxonomyInput(input);

  const updated = await serviceRequest<unknown, UpdateCompanyTaxonomyInput>({
    service: "companies",
    companyId,
    directPath: "/api/companies/me/settings",
    gatewayPath: "/api/companies/api/companies/me/settings",
    method: "PUT",
    body: payload,
    errorCode: "COMPANY_TAXONOMY_ERROR",
    errorMessage: "No se pudo actualizar la clasificación del negocio.",
  });

  return validateCompanyTaxonomy(normalizeCompanyTaxonomy(asRecord(updated)));
}

function normalizeCompanyProfile(
  row: AnyRecord,
  taxonomy: CompanyTaxonomy,
  mediaRows: AnyRecord[],
  fallbackCompanyId: number
): CompanyProfile {
  const verificationStatus = pick(row, "verificationStatus", "verification_status");
  const priceRange = asRecord(pick(row, "priceRange", "price_range"));
  const phone = toStringValue(pick(row, "phone"), "");
  const email = toStringValue(pick(row, "email"), "");
  const website = toStringValue(
    pick(row, "website", "websiteUrl", "website_url"),
    ""
  );

  return {
    companyId: toNumber(
      pick(row, "companyId", "company_id", "id"),
      fallbackCompanyId
    ),
    name: toStringValue(
      pick(row, "name", "companyName", "company_name"),
      "Mi negocio"
    ),
    description: toStringValue(pick(row, "description"), ""),
    address: toStringValue(pick(row, "address"), ""),
    phone,
    email,
    website,
    lat: toNullableNumber(pick(row, "lat", "latitude")),
    lon: toNullableNumber(pick(row, "lon", "lng", "longitude")),
    verificationStatus:
      typeof verificationStatus === "object"
        ? toStringValue(
            pick(
              asRecord(verificationStatus),
              "name",
              "label",
              "statusLabel",
              "status_label"
            ),
            "Pendiente"
          )
        : toStringValue(verificationStatus, "Pendiente"),
    priceId: toNullableNumber(
      pick(row, "priceId", "price_id") ?? pick(priceRange, "priceId", "price_id", "id")
    ),
    priceLabel:
      toStringValue(
        pick(row, "priceLabel", "price_label") ??
          pick(priceRange, "name", "label"),
        ""
      ) || null,
    media: normalizeMedia(row, mediaRows),
    contacts: normalizeContacts(phone, email, website),
    categories: taxonomy.selectedSubcategories,
    taxonomy,
  };
}

function normalizeMedia(row: AnyRecord, mediaRows: AnyRecord[]): CompanyMediaItem[] {
  const normalized = mediaRows
    .map((item) => ({
      id: toNumber(pick(item, "mediaId", "media_id", "id")),
      url: toStringValue(pick(item, "url", "fileUrl", "file_url"), ""),
      typeLabel: toStringValue(
        pick(
          item,
          "mediaTypeName",
          "media_type_name",
          "typeLabel",
          "type_label",
          "type"
        ),
        "Imagen"
      ),
      altText:
        pick(item, "altText", "alt_text") == null
          ? null
          : String(pick(item, "altText", "alt_text")),
      isCover: toBoolean(pick(item, "isCover", "is_cover"), false),
      isActive: toBoolean(pick(item, "isActive", "is_active"), true),
      sortOrder: toNumber(pick(item, "sortOrder", "sort_order"), 0),
    }))
    .filter((item) => item.id > 0 && item.url)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  // Compatibilidad defensiva con instalaciones donde Companies Service ya
  // proyecta logo/portada, sin duplicar recursos que vienen de Media Service.
  const logoUrl = toStringValue(pick(row, "logoUrl", "logo_url"), "");
  const coverUrl = toStringValue(
    pick(row, "companyCoverUrl", "company_cover_url", "coverUrl", "cover_url"),
    ""
  );

  if (logoUrl && !normalized.some((item) => item.url === logoUrl)) {
    normalized.push({
      id: -1,
      url: logoUrl,
      typeLabel: "Logo",
      altText: "Logo del negocio",
      isCover: false,
      isActive: true,
      sortOrder: -2,
    });
  }

  if (coverUrl && !normalized.some((item) => item.url === coverUrl)) {
    normalized.push({
      id: -2,
      url: coverUrl,
      typeLabel: "Portada",
      altText: "Portada del negocio",
      isCover: true,
      isActive: true,
      sortOrder: -1,
    });
  }

  return normalized;
}

function normalizeContacts(
  phone: string,
  email: string,
  website: string
): CompanyContactItem[] {
  const contacts: CompanyContactItem[] = [];
  if (phone) contacts.push({ id: "profile-phone", typeLabel: "Teléfono", value: phone });
  if (email) contacts.push({ id: "profile-email", typeLabel: "Correo", value: email });
  if (website) contacts.push({ id: "profile-website", typeLabel: "Sitio web", value: website });
  return contacts;
}

function normalizeCompanyTaxonomy(row: AnyRecord): CompanyTaxonomy {
  const catalog = asRecord(pick(row, "catalog"));
  const selected = asRecord(pick(row, "selected"));

  const businessTypes = asArray(pick(catalog, "businessTypes", "business_types"))
    .map((item) => ({
      typeId: toNumber(pick(item, "typeId", "type_id", "id")),
      name: toStringValue(pick(item, "name", "label"), "Tipo de negocio"),
    }))
    .filter((item) => item.typeId > 0);

  const categories = asArray(pick(catalog, "categories"))
    .map((item) => ({
      categoryId: toNumber(pick(item, "categoryId", "category_id", "id")),
      name: toStringValue(pick(item, "name", "label"), "Categoría"),
    }))
    .filter((item) => item.categoryId > 0);

  const subcategories = asArray(pick(catalog, "subcategories"))
    .map((item) => ({
      subcategoryId: toNumber(
        pick(item, "subcategoryId", "subcategory_id", "id")
      ),
      categoryId: toNumber(pick(item, "categoryId", "category_id")),
      name: toStringValue(pick(item, "name", "subcategoryName", "subcategory_name"), "Subcategoría"),
    }))
    .filter((item) => item.subcategoryId > 0 && item.categoryId > 0);

  const priceRanges = asArray(pick(catalog, "priceRanges", "price_ranges"))
    .map((item) => ({
      priceId: toNumber(pick(item, "priceId", "price_id", "id")),
      label: toStringValue(pick(item, "label", "name"), "Rango de precio"),
      minValue: toNullableNumber(pick(item, "minValue", "min_value")),
      maxValue: toNullableNumber(pick(item, "maxValue", "max_value")),
    }))
    .filter((item) => item.priceId > 0);

  const selectedBusinessTypeIds = asArray(
    pick(selected, "businessTypes", "business_types")
  )
    .map((item) => toNumber(pick(item, "typeId", "type_id", "id")))
    .filter((id) => id > 0);

  const selectedSubcategories: CompanyCategoryItem[] = asArray(
    pick(selected, "subcategories")
  )
    .map((item) => {
      const selectedPriceRange = asRecord(pick(item, "priceRange", "price_range"));
      return {
        subcategoryId: toNumber(
          pick(item, "subcategoryId", "subcategory_id", "id")
        ),
        subcategoryName: toStringValue(
          pick(item, "subcategoryName", "subcategory_name", "name"),
          "Subcategoría"
        ),
        categoryId: toNumber(pick(item, "categoryId", "category_id")),
        categoryName: toStringValue(
          pick(item, "categoryName", "category_name"),
          "Categoría"
        ),
        priceId: toNullableNumber(
          pick(item, "priceId", "price_id") ??
            pick(selectedPriceRange, "priceId", "price_id", "id")
        ),
        priceLabel:
          toStringValue(
            pick(item, "priceLabel", "price_label") ??
              pick(selectedPriceRange, "label", "name"),
            ""
          ) || null,
      };
    })
    .filter(
      (item) =>
        item.subcategoryId > 0 &&
        item.categoryId > 0 &&
        item.subcategoryName &&
        item.categoryName
    );

  return {
    businessTypes,
    categories,
    subcategories,
    priceRanges,
    selectedBusinessTypeIds: [...new Set(selectedBusinessTypeIds)],
    selectedSubcategories,
  };
}
