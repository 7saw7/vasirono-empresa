"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { loginService } from "@/features/auth/service";

export function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginService({ email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          Correo empresarial
        </label>
        <div className="group relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600 dark:group-focus-within:text-blue-300"
            strokeWidth={1.9}
            aria-hidden="true"
          />
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@empresa.com"
            required
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Contraseña
          </label>
          <Link
            href="/recuperar-clave"
            className="rounded-md text-xs font-semibold text-blue-700 transition hover:text-blue-800 hover:underline hover:underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 dark:text-blue-300 dark:hover:text-blue-200"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="group relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600 dark:group-focus-within:text-blue-300"
            strokeWidth={1.9}
            aria-hidden="true"
          />
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingresa tu contraseña"
            required
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.9} />
            ) : (
              <Eye className="h-[18px] w-[18px]" strokeWidth={1.9} />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p className="leading-5">{error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(37,99,235,0.95)] transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 hover:shadow-[0_20px_42px_-20px_rgba(37,99,235,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 dark:border-blue-400/20 dark:from-blue-500 dark:via-blue-500 dark:to-indigo-500 dark:hover:from-blue-400 dark:hover:via-blue-500 dark:hover:to-indigo-400 dark:focus-visible:ring-offset-[#111a24]"
      >
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            Entrar al panel
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <Link
        href="/recuperar-clave"
        className="flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/65 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 dark:border-slate-700 dark:bg-slate-900/55 dark:text-slate-200 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
      >
        Olvidé mi contraseña
      </Link>
    </form>
  );
}
