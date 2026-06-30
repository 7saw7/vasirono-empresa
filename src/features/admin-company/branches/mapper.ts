import type {
  BranchContactItem,
  BranchDetail,
  BranchListItem,
  BranchMediaItem,
  BranchScheduleItem,
  BranchServiceItem,
} from "./types";

export function mapBranchListItem(raw: {
  branch_id: number;
  company_id: number;
  name: string;
  description?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  district_id?: number | null;
  district_name: string;
  is_main: boolean;
  is_active: boolean;
  final_score?: number | null;
  visits_30d?: number | null;
  avg_rating_90d?: number | null;
}): BranchListItem {
  return {
    branchId: raw.branch_id,
    companyId: raw.company_id,
    name: raw.name,
    description: raw.description ?? "",
    address: raw.address,
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    districtId: raw.district_id ?? null,
    districtName: raw.district_name,
    isMain: raw.is_main,
    isActive: raw.is_active,
    finalScore: raw.final_score ?? null,
    visits30d: raw.visits_30d ?? null,
    avgRating90d: raw.avg_rating_90d ?? null,
  };
}

export function mapBranchScheduleItem(raw: {
  schedule_id: number;
  day_name: string;
  opening?: string | null;
  closing?: string | null;
  shift_number: number;
}): BranchScheduleItem {
  return {
    scheduleId: raw.schedule_id,
    dayName: raw.day_name,
    opening: raw.opening ?? null,
    closing: raw.closing ?? null,
    shiftNumber: raw.shift_number,
  };
}

export function mapBranchServiceItem(raw: {
  service_id: number;
  code: string;
  name: string;
  is_available: boolean;
}): BranchServiceItem {
  return {
    serviceId: raw.service_id,
    code: raw.code,
    name: raw.name,
    isAvailable: raw.is_available,
  };
}

export function mapBranchContactItem(raw: {
  contact_id: number;
  type_label: string;
  value: string;
  label?: string | null;
  is_primary: boolean;
  is_public: boolean;
}): BranchContactItem {
  return {
    contactId: raw.contact_id,
    typeLabel: raw.type_label,
    value: raw.value,
    label: raw.label ?? null,
    isPrimary: raw.is_primary,
    isPublic: raw.is_public,
  };
}

export function mapBranchMediaItem(raw: {
  media_id: number;
  type_label: string;
  url: string;
}): BranchMediaItem {
  return {
    mediaId: raw.media_id,
    typeLabel: raw.type_label,
    url: raw.url,
  };
}

export function mapBranchDetail(raw: {
  branch_id: number;
  company_id: number;
  name: string;
  description?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  district_id?: number | null;
  district_name: string;
  is_main: boolean;
  is_active: boolean;
  final_score?: number | null;
  visits_30d?: number | null;
  avg_rating_90d?: number | null;
  lat?: number | null;
  lon?: number | null;
  schedules: Array<{
    schedule_id: number;
    day_name: string;
    opening?: string | null;
    closing?: string | null;
    shift_number: number;
  }>;
  services: Array<{
    service_id: number;
    code: string;
    name: string;
    is_available: boolean;
  }>;
  contacts: Array<{
    contact_id: number;
    type_label: string;
    value: string;
    label?: string | null;
    is_primary: boolean;
    is_public: boolean;
  }>;
  media: Array<{
    media_id: number;
    type_label: string;
    url: string;
  }>;
}): BranchDetail {
  return {
    ...mapBranchListItem(raw),
    lat: raw.lat ?? null,
    lon: raw.lon ?? null,
    schedules: raw.schedules.map(mapBranchScheduleItem),
    services: raw.services.map(mapBranchServiceItem),
    contacts: raw.contacts.map(mapBranchContactItem),
    media: raw.media.map(mapBranchMediaItem),
  };
}