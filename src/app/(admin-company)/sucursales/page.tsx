import { listBranchesQuery } from "@/lib/db/queries/admin-company/branches";
import { BranchesView } from "./_components/BranchesView";

export default async function BranchesPage() {
  const branches = await listBranchesQuery();

  return <BranchesView branches={branches} />;
}