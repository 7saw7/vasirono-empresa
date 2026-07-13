import { SectionCard } from "@/components/ui/SectionCard";
import type { SecuritySettings } from "@/features/admin-company/settings/types";
import { formatDateTime } from "@/lib/utils/dates";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function SecurityCard({
  security,
}: {
  security: SecuritySettings;
}) {
  return (
    <SectionCard
      title="Seguridad"
      description="Estado general de seguridad de la cuenta empresarial."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Último cambio de contraseña
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950 dark:text-slate-100">
            {security.lastPasswordChangeAt
              ? formatDateTime(security.lastPasswordChangeAt)
              : "No registrado"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Doble factor
          </p>
          <div className="mt-2">
            {security.twoFactorEnabled ? (
              <StatusBadge label="Activo" tone="success" />
            ) : (
              <StatusBadge label="No activo" tone="warning" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sesiones activas
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {security.activeSessionsCount}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}