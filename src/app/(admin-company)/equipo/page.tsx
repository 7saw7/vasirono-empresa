import { getCompanyContext } from "@/lib/auth/company-context";
import { getTeamOverviewQuery } from "@/lib/db/queries/admin-company/team";
import { TeamView } from "./_components/TeamView";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { companyId } = await getCompanyContext("manageTeam");
  const overview = await getTeamOverviewQuery(companyId);
  return <TeamView overview={overview} />;
}
