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
  const [form, setForm] = useState<UpdateNotificationPreferencesInput>({
    notificationsEnabled: settings.notifications.notificationsEnabled,
    reviewAlerts: settings.notifications.reviewAlerts,
    verificationAlerts: settings.notifications.verificationAlerts,
  });
  const [available, setAvailable] = useState(settings.notifications.available);
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
    if (!available || loading) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await updateNotificationPreferences(form);
      setAvailable(updated.notifications.available);
      setForm({
        notificationsEnabled: updated.notifications.notificationsEnabled,
        reviewAlerts: updated.notifications.reviewAlerts,
        verificationAlerts: updated.notifications.verificationAlerts,
      });
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

  const disabled = loading || !available;

  return (
    <SectionCard
      title="Preferencias personales de notificación"
      description="Estas opciones pertenecen a tu cuenta y se aplican en todas las empresas donde participas."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!available ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            El servicio de notificaciones no está disponible. No se muestran valores confirmados ni se permiten cambios.
          </div>
        ) : null}

        <PreferenceToggle
          label="Activar notificaciones del panel"
          description="Permite crear y mostrar avisos dentro de Vasirono."
          checked={form.notificationsEnabled}
          disabled={disabled}
          onChange={(value) => setField("notificationsEnabled", value)}
        />

        <PreferenceToggle
          label="Alertas de reseñas"
          description="Recibe avisos cuando se genere actividad relacionada con reseñas."
          checked={form.reviewAlerts}
          disabled={disabled || !form.notificationsEnabled}
          onChange={(value) => setField("reviewAlerts", value)}
        />

        <PreferenceToggle
          label="Alertas de verificación"
          description="Recibe avisos sobre solicitudes y cambios de estado de verificación."
          checked={form.verificationAlerts}
          disabled={disabled || !form.notificationsEnabled}
          onChange={(value) => setField("verificationAlerts", value)}
        />

        <div className="flex items-center justify-between gap-4">
          <div>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : message ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={disabled}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <span>
        <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </span>
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 accent-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
