import { getCompanyContext } from "@/lib/auth/company-context";
import { hasPermission } from "@/lib/constants/permissions";
import { getTeamOverviewQuery } from "@/lib/db/queries/admin-company/team";
import { TeamView } from "./_components/TeamView";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const context = await getCompanyContext("viewTeam");
  const overview = await getTeamOverviewQuery(context.companyId, {
    currentUserId: context.userId,
    canManageTeam: hasPermission(context.role, "manageTeam"),
  });

  return <TeamView overview={overview} />;
}
