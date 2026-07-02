export type MediaOwnerType = "company" | "branch";

export type MediaTypeOption = {
  id: number;
  name: string;
  isUnique: boolean;
};

export type GalleryMediaItem = {
  mediaId: number;
  ownerId: number;
  ownerType: MediaOwnerType;
  mediaTypeId: number;
  mediaTypeName: string | null;
  url: string;
  sortOrder: number;
  altText: string | null;
  isCover: boolean;
  isActive: boolean;
  fileSizeBytes: number | null;
  mimeType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  ownerLabel: string;
};

export type GalleryOverview = {
  mediaTypes: MediaTypeOption[];
  companyMedia: GalleryMediaItem[];
  branchMedia: GalleryMediaItem[];
  branches: Array<{ branchId: number; name: string }>;
  planLimit: number | null;
  usedMedia: number;
};
