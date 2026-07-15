import { SectionCard } from "@/components/ui/SectionCard";
import type { SecuritySettings } from "@/features/admin-company/settings/types";
import { formatDateTime } from "@/lib/utils/dates";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function SecurityCard({ security }: { security: SecuritySettings }) {
  return (
    <SectionCard
      title="Seguridad de la cuenta"
      description="Datos reales de autenticación asociados a tu usuario."
    >
      {!security.available ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          No se pudo consultar Auth. Los datos de seguridad no se reemplazan por valores estimados.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Último cambio de contraseña
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-slate-100">
              {security.lastPasswordChangeAt
                ? formatDateTime(security.lastPasswordChangeAt)
                : "La cuenta no tiene contraseña local registrada"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Doble factor
            </p>
            <div className="mt-2">
              {!security.twoFactorAvailable ? (
                <StatusBadge label="Próximamente" tone="default" />
              ) : security.twoFactorEnabled ? (
                <StatusBadge label="Activo" tone="success" />
              ) : (
                <StatusBadge label="No activo" tone="warning" />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Sesiones activas
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
              {security.activeSessionsCount ?? "—"}
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
