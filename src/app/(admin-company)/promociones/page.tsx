import { getCompanyContext } from "@/lib/auth/company-context";
import { listBranchesQuery } from "@/lib/db/queries/admin-company/branches";
import { getPromotionsOverviewQuery } from "@/lib/db/queries/admin-company/promotions";
import { PromotionsView } from "./_components/PromotionsView";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const { companyId } = await getCompanyContext("managePromotions");
  const [overview, branches] = await Promise.all([
    getPromotionsOverviewQuery(companyId, { page: 1, pageSize: 20 }),
    listBranchesQuery(companyId),
  ]);

  return (
    <PromotionsView
      initialPromotions={overview.promotions.items}
      initialPagination={overview.promotions.pagination}
      gate={overview.gate}
      branches={branches}
    />
  );
}
