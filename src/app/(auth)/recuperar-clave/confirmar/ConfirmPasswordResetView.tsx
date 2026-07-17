"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import {
  confirmPasswordResetService,
  verifyPasswordResetTokenService,
} from "@/features/auth/service";

type LinkState = "checking" | "valid" | "invalid" | "completed";

export function ConfirmPasswordResetView({ token }: { token: string }) {
  const [state, setState] = useState<LinkState>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    window.history.replaceState(null, "", "/recuperar-clave/confirmar");
    if (!token) {
      setMessage("El enlace de recuperación no es válido.");
      setState("invalid");
      return;
    }

    verifyPasswordResetTokenService(token)
      .then(() => setState("valid"))
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "El enlace no es válido o expiró.");
        setState("invalid");
      });
  }, [token]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordResetService({ token, newPassword });
      setState("completed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12 text-slate-950 dark:bg-[#080f16] dark:text-white">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-700 dark:bg-[#111a24] sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Crea una nueva contraseña</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          El enlace es personal, expira y solo puede utilizarse una vez.
        </p>

        {state === "checking" ? (
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Validando enlace…
          </div>
        ) : null}

        {state === "invalid" ? (
          <div className="mt-8 space-y-5">
            <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
            <Link href="/recuperar-clave" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white">
              Solicitar un nuevo enlace
            </Link>
          </div>
        ) : null}

        {state === "valid" ? (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <PasswordField label="Nueva contraseña" value={newPassword} onChange={setNewPassword} />
            <PasswordField label="Confirmar contraseña" value={confirmPassword} onChange={setConfirmPassword} />
            <p className="text-xs leading-5 text-slate-500">Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.</p>
            {message ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p> : null}
            <button disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Cambiar contraseña
            </button>
          </form>
        ) : null}

        {state === "completed" ? (
          <div className="mt-8 space-y-5">
            <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>Tu contraseña fue actualizada. Las sesiones anteriores fueron cerradas.</span>
            </div>
            <Link href="/login" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white">
              Iniciar sesión
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}
