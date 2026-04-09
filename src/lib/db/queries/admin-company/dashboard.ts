import { getCompanyContext } from "@/lib/auth/company-context";
import { getDashboardData } from "@/features/admin-company/dashboard/service";

export async function getDashboardQuery() {
  await getCompanyContext();
  return getDashboardData();
}