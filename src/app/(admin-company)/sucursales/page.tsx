import { getCompanyContext } from "@/lib/auth/company-context";
import {
  listBranchDistrictOptionsQuery,
  listBranchesQuery,
} from "@/lib/db/queries/admin-company/branches";
import { BranchesView } from "./_components/BranchesView";

type BranchesPageProps = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    districtId?: string;
  }>;
};

export default async function BranchesPage({
  searchParams,
}: BranchesPageProps) {
  const { companyId } = await getCompanyContext("manageBranches");
  const params = (await searchParams) ?? {};

  const filters = {
    search: params.search?.trim() || undefined,
    status:
      params.status === "active" || params.status === "inactive"
        ? params.status
        : undefined,
    districtId: params.districtId ? Number(params.districtId) : undefined,
  };

  const [items, districts] = await Promise.all([
    listBranchesQuery(companyId, filters),
    listBranchDistrictOptionsQuery(companyId),
  ]);

  return <BranchesView items={items} districts={districts} />;
}