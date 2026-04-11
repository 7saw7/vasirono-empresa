import { getCompanyContext } from "@/lib/auth/company-context";
import { getCompanySettingsQuery } from "@/lib/db/queries/admin-company/settings";
import { SettingsView } from "./_components/SettingsView";

export default async function SettingsPage() {
  const { companyId } = await getCompanyContext("manageSettings");
  const settings = await getCompanySettingsQuery(companyId);

  return <SettingsView settings={settings} />;
}