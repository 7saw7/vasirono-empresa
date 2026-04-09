import { getDashboardQuery } from "@/lib/db/queries/admin-company/dashboard";
import { DashboardView } from "./_components/DashboardView";

export default async function DashboardPage() {
  const data = await getDashboardQuery();

  return <DashboardView data={data} />;
}