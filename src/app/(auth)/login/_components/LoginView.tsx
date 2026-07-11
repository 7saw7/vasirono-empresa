import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";
import { LoginForm } from "./LoginForm";

const accessBenefits = [
  {
    title: "Acceso verificado",
    description: "Disponible solo para empresas y responsables autorizados.",
    icon: BadgeCheck,
  },
  {
    title: "Gestión centralizada",
    description:
      "Administra sucursales, reseñas, métricas y equipo desde un solo lugar.",
    icon: Building2,
  },
  {
    title: "Sesión protegida",
    description:
      "Controles de acceso y permisos pensados para información empresarial.",
    icon: ShieldCheck,
  },
] as const;

function BrandMark() {
  return (
    <span
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute left-[14%] top-[13%] h-[72%] w-[42%] -skew-x-[20deg] rounded-[5px] bg-gradient-to-b from-blue-500 to-indigo-600" />
      <span className="absolute right-[14%] top-[13%] h-[72%] w-[42%] skew-x-[20deg] rounded-[5px] bg-gradient-to-b from-sky-400 to-blue-500" />
      <span className="absolute bottom-[11%] left-1/2 h-[18%] w-[18%] -translate-x-1/2 rotate-45 rounded-[2px] bg-indigo-600" />
    </span>
  );
}

function AccessPreview() {
  return (
    <div className="relative mt-9 hidden max-w-xl lg:block">
      <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/78 p-3 shadow-[0_28px_80px_-38px_rgba(37,99,235,0.42),0_18px_50px_-34px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-700/75 dark:bg-[#111b26]/78 dark:shadow-[0_32px_80px_-42px_rgba(37,99,235,0.28),0_20px_55px_-34px_rgba(0,0,0,0.8)]">
        <div className="rounded-[1.3rem] border border-slate-200/80 bg-white p-5 dark:border-slate-700/70 dark:bg-[#111a24]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                <LockKeyhole className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Inicio de sesión seguro
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Cuenta empresarial validada
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Protegido
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["Empresas", "120+"],
              ["Sucursales", "480+"],
              ["Reseñas", "9.2k"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200/75 bg-slate-50/80 px-4 py-3 dark:border-slate-700/65 dark:bg-slate-900/55"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1.5 text-xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginView({ email }: { email?: string }) {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#080f16] dark:text-white">
      <Navbar />

      <main className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.15),transparent_31%),radial-gradient(circle_at_10%_70%,rgba(124,58,237,0.10),transparent_28%),linear-gradient(to_bottom,#ffffff_0%,#fbfdff_58%,#f6faff_100%)] dark:bg-[radial-gradient(circle_at_82%_20%,rgba(37,99,235,0.15),transparent_31%),radial-gradient(circle_at_10%_70%,rgba(124,58,237,0.10),transparent_28%),linear-gradient(to_bottom,#080f16_0%,#09121b_58%,#0a141e_100%)]"
        />
        <div
          aria-hidden="true"
          className="landing-grid pointer-events-none absolute inset-0 -z-20 opacity-55 dark:opacity-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full border-[54px] border-blue-100/45 dark:border-blue-500/[0.045]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[5%] top-[15%] -z-10 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/5"
        />

        <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1440px] items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.78fr] lg:gap-16 lg:px-8 lg:py-20 xl:gap-24 xl:px-12">
          <section className="mx-auto w-full max-w-2xl lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur dark:border-blue-500/20 dark:bg-blue-500/5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                Panel empresarial Vasirono
              </p>
            </div>

            <h1 className="mt-6 max-w-2xl text-[clamp(2.65rem,5.2vw,4.9rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 dark:text-white">
              Vuelve a tener el control de tu negocio.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Accede a tu espacio empresarial verificado para administrar sedes,
              reputación, analítica y operaciones desde una experiencia clara y
              segura.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {accessBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-slate-200/75 bg-white/65 p-4 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/35"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                      {benefit.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <AccessPreview />
          </section>

          <section className="mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end">
            <div className="relative">
              <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/15 via-indigo-500/5 to-transparent blur-2xl dark:from-blue-500/10" />

              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 p-2 shadow-[0_34px_90px_-42px_rgba(37,99,235,0.42),0_24px_60px_-42px_rgba(15,23,42,0.40)] backdrop-blur-xl dark:border-slate-700/75 dark:bg-[#101923]/92 dark:shadow-[0_38px_100px_-48px_rgba(37,99,235,0.25),0_24px_68px_-40px_rgba(0,0,0,0.86)]">
                <div className="rounded-[1.6rem] border border-slate-200/80 bg-white px-6 py-7 dark:border-slate-700/70 dark:bg-[#111a24] sm:px-8 sm:py-9">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <BrandMark />
                      <div>
                        <p className="text-sm font-bold tracking-[-0.025em] text-slate-950 dark:text-white">
                          Vasirono
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Acceso empresarial
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Seguro
                    </span>
                  </div>

                  <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                      Bienvenido de nuevo
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white">
                      Inicia sesión en tu panel
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Usa las credenciales asociadas a tu cuenta empresarial.
                    </p>
                  </div>

                  <div className="mt-7">
                    <LoginForm initialEmail={email} />
                  </div>

                  <div
                    className="my-7 flex items-center gap-3"
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Acceso por invitación
                    </span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/70 dark:bg-slate-900/45">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ¿Aún no tienes acceso?
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Reclama un negocio existente o registra uno nuevo desde la
                      experiencia pública de Vasirono.
                    </p>
                    <Link
                      href={onboardingUrl}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Reclamar o registrar negocio
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <p className="mt-5 text-center text-[11px] leading-5 text-slate-400 dark:text-slate-500">
                    Al ingresar confirmas que eres una persona autorizada para
                    administrar esta cuenta empresarial.
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
