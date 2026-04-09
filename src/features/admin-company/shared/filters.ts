export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type DateRangeFilter = {
  from?: string;
  to?: string;
};

export type SearchFilter = {
  search?: string;
};

export type StatusFilter = {
  status?: string;
};

export type BranchFilterParams = PaginationParams &
  SearchFilter &
  StatusFilter & {
    districtId?: number;
    isActive?: boolean;
  };

export type ReviewFilterParams = PaginationParams &
  SearchFilter &
  StatusFilter & {
    rating?: number;
    branchId?: number;
    responded?: boolean;
  };

export type AnalyticsFilterParams = DateRangeFilter & {
  branchId?: number;
  source?: string;
};