export type CompanyMediaItem = {
  id: number;
  url: string;
  typeLabel: string;
};

export type CompanyContactItem = {
  id: number;
  typeLabel: string;
  value: string;
  isPrimary: boolean;
  isPublic: boolean;
};

export type CompanyCategoryItem = {
  subcategoryId: number;
  subcategoryName: string;
  categoryName: string;
  priceLabel?: string | null;
};

export type CompanyProfile = {
  companyId: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  verificationStatus: string;
  priceLabel?: string | null;
  media: CompanyMediaItem[];
  contacts: CompanyContactItem[];
  categories: CompanyCategoryItem[];
};

export type UpdateCompanyProfileInput = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};