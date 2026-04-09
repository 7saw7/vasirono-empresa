import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "@/features/admin-company/company/service";
import type { UpdateCompanyProfileInput } from "@/features/admin-company/company/types";

export async function getCompanyProfileQuery() {
  await getCompanyContext();
  return getCompanyProfile();
}

export async function updateCompanyProfileQuery(
  input: UpdateCompanyProfileInput
) {
  await getCompanyContext();
  return updateCompanyProfile(input);
}