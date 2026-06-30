import type {
  CompanyCategoryItem,
  CompanyContactItem,
  CompanyMediaItem,
  CompanyProfile,
} from "./types";

type RawCompanyMediaItem = {
  media_id: number;
  url: string;
  type_label: string;
};

type RawCompanyContactItem = {
  id: number;
  type_label: string;
  value: string;
  is_primary: boolean;
  is_public: boolean;
};

type RawCompanyCategoryItem = {
  subcategory_id: number;
  subcategory_name: string;
  category_name: string;
  price_label?: string | null;
};

type RawCompanyProfile = {
  company_id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  verification_status: string | null;
  price_label?: string | null;
  media: RawCompanyMediaItem[];
  contacts: RawCompanyContactItem[];
  categories: RawCompanyCategoryItem[];
};

export function mapCompanyMediaItem(raw: RawCompanyMediaItem): CompanyMediaItem {
  return {
    id: raw.media_id,
    url: raw.url,
    typeLabel: raw.type_label,
  };
}

export function mapCompanyContactItem(
  raw: RawCompanyContactItem
): CompanyContactItem {
  return {
    id: raw.id,
    typeLabel: raw.type_label,
    value: raw.value,
    isPrimary: raw.is_primary,
    isPublic: raw.is_public,
  };
}

export function mapCompanyCategoryItem(
  raw: RawCompanyCategoryItem
): CompanyCategoryItem {
  return {
    subcategoryId: raw.subcategory_id,
    subcategoryName: raw.subcategory_name,
    categoryName: raw.category_name,
    priceLabel: raw.price_label ?? null,
  };
}

export function mapCompanyProfile(raw: RawCompanyProfile): CompanyProfile {
  return {
    companyId: raw.company_id,
    name: raw.name,
    description: raw.description ?? "",
    address: raw.address ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    website: raw.website ?? "",
    verificationStatus: raw.verification_status ?? "Pendiente",
    priceLabel: raw.price_label ?? null,
    media: raw.media.map(mapCompanyMediaItem),
    contacts: raw.contacts.map(mapCompanyContactItem),
    categories: raw.categories.map(mapCompanyCategoryItem),
  };
}