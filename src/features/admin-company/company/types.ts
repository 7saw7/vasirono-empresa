export type CompanyMediaItem = {
  id: number;
  url: string;
  typeLabel: string;
  altText: string | null;
  isCover: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type CompanyContactItem = {
  id: string;
  typeLabel: string;
  value: string;
};

export type CompanyBusinessTypeOption = {
  typeId: number;
  name: string;
};

export type CompanyCategoryOption = {
  categoryId: number;
  name: string;
};

export type CompanySubcategoryOption = {
  subcategoryId: number;
  categoryId: number;
  name: string;
};

export type CompanyPriceRangeOption = {
  priceId: number;
  label: string;
  minValue: number | null;
  maxValue: number | null;
};

export type CompanyCategoryItem = {
  subcategoryId: number;
  subcategoryName: string;
  categoryId: number;
  categoryName: string;
  priceId: number | null;
  priceLabel: string | null;
};

export type CompanyTaxonomy = {
  businessTypes: CompanyBusinessTypeOption[];
  categories: CompanyCategoryOption[];
  subcategories: CompanySubcategoryOption[];
  priceRanges: CompanyPriceRangeOption[];
  selectedBusinessTypeIds: number[];
  selectedSubcategories: CompanyCategoryItem[];
};

export type CompanyProfile = {
  companyId: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  lat: number | null;
  lon: number | null;
  verificationStatus: string;
  priceId: number | null;
  priceLabel: string | null;
  media: CompanyMediaItem[];
  contacts: CompanyContactItem[];
  categories: CompanyCategoryItem[];
  taxonomy: CompanyTaxonomy;
};

export type UpdateCompanyProfileInput = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  lat: number | null;
  lon: number | null;
  priceId: number | null;
};

export type UpdateCompanyTaxonomyInput = {
  businessTypeIds: number[];
  subcategories: Array<{
    subcategoryId: number;
    priceId: number | null;
  }>;
};
