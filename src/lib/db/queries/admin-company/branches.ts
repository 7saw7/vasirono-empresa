import { getCompanyContext } from "@/lib/auth/company-context";
import {
  createBranch,
  getBranchById,
  listBranches,
  updateBranch,
} from "@/features/admin-company/branches/service";
import type {
  BranchListFilters,
  UpsertBranchInput,
} from "@/features/admin-company/branches/types";

export async function listBranchesQuery(filters: BranchListFilters = {}) {
  await getCompanyContext();
  return listBranches(filters);
}

export async function getBranchByIdQuery(branchId: number) {
  await getCompanyContext();
  return getBranchById(branchId);
}

export async function createBranchQuery(input: UpsertBranchInput) {
  await getCompanyContext();
  return createBranch(input);
}

export async function updateBranchQuery(
  branchId: number,
  input: UpsertBranchInput
) {
  await getCompanyContext();
  return updateBranch(branchId, input);
}