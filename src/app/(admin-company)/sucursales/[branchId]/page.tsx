import { getCompanyContext } from "@/lib/auth/company-context";
import { getBranchByIdQuery } from "@/lib/db/queries/admin-company/branches";
import { BranchDetailView } from "./_components/BranchDetailView";

type PageProps = {
  params: Promise<{
    branchId: string;
  }>;
};

export default async function BranchDetailPage({ params }: PageProps) {
  const { companyId } = await getCompanyContext("manageBranches");
  const { branchId } = await params;
  const branch = await getBranchByIdQuery(companyId, Number(branchId));

  return <BranchDetailView branch={branch} />;
}