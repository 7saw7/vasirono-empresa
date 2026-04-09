export type Id = string | number;

export type BaseRecord = {
  createdAt?: string;
  updatedAt?: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type ApiListResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page?: number;
    pageSize?: number;
  };
};

export type ApiItemResponse<T> = {
  data: T;
};

export type StatusSummary = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};