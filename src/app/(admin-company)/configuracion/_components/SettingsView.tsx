import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import type { CompanySettings } from "@/features/admin-company/settings/types";
import { NotificationPreferencesForm } from "./NotificationPreferencesForm";
import { SecurityCard } from "./SecurityCard";

export function SettingsView({
  settings,
}: {
  settings: CompanySettings;
}) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Configuración"
        description="Administra preferencias operativas y parámetros básicos de seguridad."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <NotificationPreferencesForm settings={settings} />
        <SecurityCard security={settings.security} />
      </div>
    </div>
  );
}