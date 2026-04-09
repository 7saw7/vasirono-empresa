import { getBranchByIdQuery } from "@/lib/db/queries/admin-company/branches";
import { BranchDetailView } from "./_components/BranchDetailView";

type PageProps = {
  params: Promise<{
    branchId: string;
  }>;
};

export default async function BranchDetailPage({ params }: PageProps) {
  const { branchId } = await params;
  const branch = await getBranchByIdQuery(Number(branchId));

  return <BranchDetailView branch={branch} />;
}