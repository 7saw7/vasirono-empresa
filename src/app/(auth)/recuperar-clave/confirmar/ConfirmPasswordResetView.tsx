"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  KeyRound,
} from "lucide-react";
import {
  confirmPasswordResetService,
  verifyPasswordResetCodeService,
} from "@/features/auth/service";

type ResetState = "verification" | "valid" | "completed";

export function ConfirmPasswordResetView({
  initialEmail,
}: {
  initialEmail: string;
}) {
  const [state, setState] = useState<ResetState>("verification");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", "/recuperar-clave/confirmar");
    }
  }, []);

  async function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await verifyPasswordResetCodeService({ email, code });
      setState("valid");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo validar el código de recuperación.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordResetService({ email, code, newPassword });
      setState("completed");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña.",
      );
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
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Crea una nueva contraseña
        </h1>

        {state === "verification" ? (
          <form onSubmit={onVerify} className="mt-8 space-y-5">
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              Ingresa el correo de tu cuenta empresarial y el código de 6
              dígitos que recibiste.
            </p>
            <TextField
              label="Correo empresarial"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              icon={<Mail className="h-4 w-4" />}
            />
            <TextField
              label="Código de recuperación"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              icon={<KeyRound className="h-4 w-4" />}
            />
            {message ? <ErrorMessage message={message} /> : null}
            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Validar código
            </button>
            <Link
              href="/recuperar-clave"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Solicitar un código nuevo
            </Link>
          </form>
        ) : null}

        {state === "valid" ? (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              Código validado. Define una contraseña nueva para tu cuenta.
            </p>
            <PasswordField
              label="Nueva contraseña"
              value={newPassword}
              onChange={setNewPassword}
            />
            <PasswordField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <p className="text-xs leading-5 text-slate-500">
              Usa al menos 8 caracteres, una mayúscula, una minúscula y un
              número.
            </p>
            {message ? <ErrorMessage message={message} /> : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Cambiar contraseña
            </button>
            <button
              type="button"
              onClick={() => {
                setMessage(null);
                setState("verification");
              }}
              className="w-full text-sm font-semibold text-blue-600 dark:text-blue-300"
            >
              Ingresar otro código
            </button>
          </form>
        ) : null}

        {state === "completed" ? (
          <div className="mt-8 space-y-5">
            <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Tu contraseña fue actualizada. Las sesiones anteriores fueron
                cerradas.
              </span>
            </div>
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

type TextFieldProps = {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  autoComplete?: string;
  inputMode?: "numeric";
  pattern?: string;
  minLength?: number;
  maxLength?: number;
};

function TextField({
  label,
  type,
  value,
  onChange,
  icon,
  ...inputProps
}: TextFieldProps) {
  return (
    <label className="block space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
          {...inputProps}
        />
      </span>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      label={label}
      type="password"
      autoComplete="new-password"
      minLength={8}
      maxLength={128}
      value={value}
      onChange={onChange}
      icon={<LockKeyhole className="h-4 w-4" />}
    />
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p
      className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
