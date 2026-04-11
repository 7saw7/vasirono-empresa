import {
  validateBranchDetail,
  validateBranchList,
  validateUpsertBranchInput,
} from "./schema";
import type {
  BranchDetail,
  BranchDistrictOption,
  BranchListFilters,
  BranchListItem,
  UpsertBranchInput,
} from "./types";

function toQueryString(filters: BranchListFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (typeof filters.districtId === "number") {
    params.set("districtId", String(filters.districtId));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listBranches(
  filters: BranchListFilters = {}
): Promise<BranchListItem[]> {
  const response = await fetch(
    `/api/admin-company/branches${toQueryString(filters)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudieron cargar las sucursales."
    );
  }

  return validateBranchList(payload.data);
}

export async function getBranchById(branchId: number): Promise<BranchDetail> {
  const response = await fetch(`/api/admin-company/branches/${branchId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudo cargar la sucursal.");
  }

  return validateBranchDetail(payload.data);
}

export async function createBranch(
  input: UpsertBranchInput
): Promise<BranchListItem> {
  const parsed = validateUpsertBranchInput(input);

  const response = await fetch("/api/admin-company/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudo crear la sucursal.");
  }

  return payload.data as BranchListItem;
}

export async function updateBranch(
  branchId: number,
  input: UpsertBranchInput
): Promise<BranchListItem> {
  const parsed = validateUpsertBranchInput(input);

  const response = await fetch(`/api/admin-company/branches/${branchId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo actualizar la sucursal."
    );
  }

  return payload.data as BranchListItem;
}

export async function getBranchDistrictOptions(): Promise<
  BranchDistrictOption[]
> {
  const response = await fetch(
    "/api/admin-company/branches/district-options",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudieron cargar los distritos."
    );
  }

  return payload.data as BranchDistrictOption[];
}