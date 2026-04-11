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
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Último cambio de contraseña
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-950">
            {security.lastPasswordChangeAt
              ? formatDateTime(security.lastPasswordChangeAt)
              : "No registrado"}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
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

        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Sesiones activas
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {security.activeSessionsCount}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}