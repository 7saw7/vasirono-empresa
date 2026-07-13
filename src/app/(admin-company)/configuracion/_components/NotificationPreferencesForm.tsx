"use client";

import { useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Button } from "@/components/ui/Button";
import { updateNotificationPreferences } from "@/features/admin-company/settings/service";
import type {
  CompanySettings,
  UpdateNotificationPreferencesInput,
} from "@/features/admin-company/settings/types";

export function NotificationPreferencesForm({
  settings,
}: {
  settings: CompanySettings;
}) {
  const [form, setForm] = useState<UpdateNotificationPreferencesInput>(
    settings.notifications
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof UpdateNotificationPreferencesInput>(
    key: K,
    value: UpdateNotificationPreferencesInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateNotificationPreferences(form);
      setMessage("Preferencias actualizadas correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron actualizar las preferencias."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Preferencias de notificación"
      description="Define qué tipo de avisos quieres recibir desde el panel."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <span className="text-sm text-slate-800 dark:text-slate-200">Notificaciones por correo</span>
          <input
            type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-500 dark:border-slate-600 dark:bg-slate-900"
            checked={form.emailNotifications}
            onChange={(e) => setField("emailNotifications", e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <span className="text-sm text-slate-800 dark:text-slate-200">Alertas de reseñas</span>
          <input
            type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-500 dark:border-slate-600 dark:bg-slate-900"
            checked={form.reviewAlerts}
            onChange={(e) => setField("reviewAlerts", e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <span className="text-sm text-slate-800 dark:text-slate-200">Alertas de verificación</span>
          <input
            type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-500 dark:border-slate-600 dark:bg-slate-900"
            checked={form.verificationAlerts}
            onChange={(e) => setField("verificationAlerts", e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <span className="text-sm text-slate-800 dark:text-slate-200">Resumen semanal</span>
          <input
            type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-500 dark:border-slate-600 dark:bg-slate-900"
            checked={form.weeklySummary}
            onChange={(e) => setField("weeklySummary", e.target.checked)}
          />
        </label>

        <div className="flex items-center justify-between gap-4">
          <div>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : message ? (
              <p className="text-sm text-emerald-600">{message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}