"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { changePassword } from "@/features/admin-company/settings/service";
import type { ChangePasswordInput } from "@/features/admin-company/settings/types";

const EMPTY_FORM: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await changePassword(form);
      router.replace("/login?passwordChanged=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Cambiar contraseña"
      description="Al guardar, Auth revocará todas tus sesiones y deberás iniciar sesión nuevamente."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordInput
          label="Contraseña actual"
          value={form.currentPassword}
          disabled={loading}
          onChange={(value) => setForm((current) => ({ ...current, currentPassword: value }))}
        />
        <PasswordInput
          label="Nueva contraseña"
          value={form.newPassword}
          disabled={loading}
          onChange={(value) => setForm((current) => ({ ...current, newPassword: value }))}
        />
        <PasswordInput
          label="Confirmar nueva contraseña"
          value={form.confirmPassword}
          disabled={loading}
          onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
        />

        <div className="flex items-center justify-between gap-4">
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : <span />}
          <Button type="submit" disabled={loading}>
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

function PasswordInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </span>
      <input
        type="password"
        autoComplete={label === "Contraseña actual" ? "current-password" : "new-password"}
        minLength={8}
        maxLength={128}
        required
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
  );
}
