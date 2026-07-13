export type BranchListItem = {
  branchId: number;
  companyId: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  districtId?: number | null;
  districtName: string;
  isMain: boolean;
  isActive: boolean;
  finalScore?: number | null;
  visits30d?: number | null;
  avgRating90d?: number | null;
  reviews90d?: number | null;
};

export type BranchDetail = BranchListItem & {
  lat?: number | null;
  lon?: number | null;
  schedules: BranchScheduleItem[];
  services: BranchServiceItem[];
  contacts: BranchContactItem[];
  media: BranchMediaItem[];
};

export type BranchScheduleItem = {
  scheduleId: number;
  dayId: number;
  dayName: string;
  isoNumber: number;
  opening?: string | null;
  closing?: string | null;
  shiftNumber: number;
};

export type BranchServiceItem = {
  serviceId: number;
  code: string;
  name: string;
  isAvailable: boolean;
};

export type BranchContactItem = {
  contactId: number;
  contactTypeId: number;
  typeLabel: string;
  value: string;
  label?: string | null;
  isPrimary: boolean;
  isPublic: boolean;
};

export type BranchMediaItem = {
  mediaId: number;
  typeLabel: string;
  url: string;
};

export type BranchListFilters = {
  search?: string;
  status?: string;
  districtId?: number;
};

export type UpsertBranchInput = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  districtId: number;
  isMain: boolean;
  isActive: boolean;
};

export type BranchDistrictOption = { id: number; name: string };

export type BranchContactInput = {
  contactTypeId: number;
  value: string;
  label?: string;
  isPrimary: boolean;
  isPublic: boolean;
};

export type BranchScheduleInput = {
  scheduleId?: number;
  dayId: number;
  opening?: string;
  closing?: string;
  shiftNumber: number;
};

export type BranchHourExceptionInput = {
  exceptionDate: string;
  isClosed: boolean;
  opening?: string;
  closing?: string;
  reason?: string;
  notes?: string;
};

export type BranchServiceAttachInput = {
  serviceId: number;
  isAvailable: boolean;
};
