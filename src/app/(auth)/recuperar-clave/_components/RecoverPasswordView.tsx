"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { recoverPasswordService } from "@/features/auth/service";

export function RecoverPasswordView() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(false);
    setError(null);
    setLoading(true);

    try {
      await recoverPasswordService(email);
      setSubmittedEmail(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar la recuperación.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#080f16] dark:text-white">
      <Navbar />

      <main className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_75%_18%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_18%_78%,rgba(124,58,237,0.10),transparent_27%),linear-gradient(to_bottom,#ffffff_0%,#fbfdff_58%,#f6faff_100%)] dark:bg-[radial-gradient(circle_at_75%_18%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_18%_78%,rgba(124,58,237,0.10),transparent_27%),linear-gradient(to_bottom,#080f16_0%,#09121b_58%,#0a141e_100%)]"
        />
        <div
          aria-hidden="true"
          className="landing-grid pointer-events-none absolute inset-0 -z-20 opacity-55 dark:opacity-20"
        />

        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 xl:px-12">
          <section className="w-full max-w-[540px]">
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-500/15 via-indigo-500/5 to-transparent blur-3xl dark:from-blue-500/10" />

              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 p-2 shadow-[0_34px_90px_-42px_rgba(37,99,235,0.42),0_24px_60px_-42px_rgba(15,23,42,0.40)] backdrop-blur-xl dark:border-slate-700/75 dark:bg-[#101923]/92 dark:shadow-[0_38px_100px_-48px_rgba(37,99,235,0.25),0_24px_68px_-40px_rgba(0,0,0,0.86)]">
                <div className="rounded-[1.6rem] border border-slate-200/80 bg-white px-6 py-8 dark:border-slate-700/70 dark:bg-[#111a24] sm:px-9 sm:py-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                    <ShieldCheck className="h-6 w-6" strokeWidth={1.9} />
                  </div>

                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                    Recuperación segura
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl">
                    Recupera el acceso a tu panel
                  </h1>
                  <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Ingresa el correo asociado a tu cuenta empresarial. Si
                    existe una cuenta válida, recibirás un código de 6 dígitos
                    para continuar.
                  </p>

                  <form onSubmit={onSubmit} className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="recovery-email"
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
                          id="recovery-email"
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

                    {submitted ? (
                      <div
                        className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                        role="status"
                        aria-live="polite"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <p className="leading-5">
                          Si el correo existe, recibirás un código de recuperación.
                          Revisa también la carpeta de spam.
                        </p>
                      </div>
                    ) : null}

                    {submitted ? (
                      <Link
                        href={`/recuperar-clave/confirmar?email=${encodeURIComponent(submittedEmail)}`}
                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
                      >
                        Ingresar código de recuperación
                      </Link>
                    ) : null}

                    {error ? (
                      <div
                        className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
                          Enviando código...
                        </>
                      ) : (
                        "Enviar código"
                      )}
                    </button>
                  </form>

                  <Link
                    href="/login"
                    className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/65 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 dark:border-slate-700 dark:bg-slate-900/55 dark:text-slate-200 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio de sesión
                  </Link>

                  <p className="mt-6 text-center text-[11px] leading-5 text-slate-400 dark:text-slate-500">
                    Por seguridad, Vasirono no confirma públicamente si un
                    correo está registrado.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
