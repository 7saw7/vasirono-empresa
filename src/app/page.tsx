import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Building2,
  CheckCircle2,
  ChevronDown,
  Layers3,
  LineChart,
  LockKeyhole,
  MapPin,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Star,
  Store,
  UsersRound,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";

const stats = [
  {
    label: "Empresas activas",
    value: "120+",
    helper: "Referencia visual temporal",
    icon: Building2,
    iconClass:
      "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  },
  {
    label: "Sucursales gestionadas",
    value: "480+",
    helper: "Preparado para múltiples sedes",
    icon: Store,
    iconClass:
      "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  },
  {
    label: "Reseñas procesadas",
    value: "9.2k",
    helper: "Base para reputación y analytics",
    icon: Star,
    iconClass:
      "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
] as const;

const previewNav = [
  { label: "Resumen", icon: BarChart3, active: true },
  { label: "Sucursales", icon: Store, active: false },
  { label: "Reseñas", icon: Star, active: false },
  { label: "Analytics", icon: LineChart, active: false },
  { label: "Verificaciones", icon: ShieldCheck, active: false },
  { label: "Perfil del negocio", icon: Building2, active: false },
  { label: "Configuración", icon: Settings, active: false },
] as const;

const activity = [
  {
    title: "Nueva reseña recibida",
    branch: "Sucursal Centro",
    time: "Hace 2 min",
    icon: MessageSquareText,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  },
  {
    title: "Verificación aprobada",
    branch: "Sucursal Norte",
    time: "Hace 15 min",
    icon: ShieldCheck,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  {
    title: "Perfil del negocio actualizado",
    branch: "Sucursal Sur",
    time: "Hace 1 h",
    icon: Building2,
    iconClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  },
] as const;

function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <span className="absolute left-[14%] top-[13%] h-[72%] w-[42%] -skew-x-[20deg] rounded-[4px] bg-gradient-to-b from-blue-500 to-indigo-600" />
      <span className="absolute right-[14%] top-[13%] h-[72%] w-[42%] skew-x-[20deg] rounded-[4px] bg-gradient-to-b from-sky-400 to-blue-500" />
      <span className="absolute bottom-[11%] left-1/2 h-[18%] w-[18%] -translate-x-1/2 rotate-45 rounded-[2px] bg-indigo-600" />
    </span>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] lg:mx-0">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_68%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_68%)]" />

      <div className="landing-dashboard-preview overflow-hidden rounded-[1.65rem] border border-white/75 bg-white/[0.92] shadow-[0_34px_90px_-34px_rgba(37,99,235,0.36),0_18px_50px_-28px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-[#101923]/95 dark:shadow-[0_34px_90px_-34px_rgba(2,132,199,0.18),0_18px_50px_-28px_rgba(0,0,0,0.72)]">
        <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-700/70 sm:px-5">
          <div className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" />
            <span className="text-xs font-bold tracking-tight text-slate-950 dark:text-white">
              Vasirono
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
                A
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[10px] font-semibold leading-none text-slate-800 dark:text-slate-100">
                  Admin
                </p>
                <p className="mt-1 text-[8px] leading-none text-slate-400">
                  Admin company
                </p>
              </div>
              <ChevronDown
                className="h-3 w-3 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="grid min-h-[390px] grid-cols-[112px_minmax(0,1fr)] sm:grid-cols-[144px_minmax(0,1fr)]">
          <aside className="border-r border-slate-200/80 bg-slate-50/75 p-2.5 dark:border-slate-700/70 dark:bg-[#0c141d]/80 sm:p-3">
            <div className="space-y-1">
              {previewNav.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[8px] font-medium sm:text-[9px] ${
                      item.active
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 bg-white p-3 dark:bg-[#111a24] sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-950 dark:text-white sm:text-xs">
                  Resumen general
                </p>
                <p className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">
                  Vista rápida del rendimiento de tu negocio
                </p>
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 sm:inline-flex">
                <CheckCircle2 className="h-3 w-3" /> Verificado
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] dark:border-slate-700/70 dark:bg-[#141f2a] sm:p-3"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="line-clamp-2 text-[7px] font-medium leading-tight text-slate-500 dark:text-slate-400 sm:text-[8px]">
                        {stat.label}
                      </p>
                      <span className={`rounded-full p-1 ${stat.iconClass}`}>
                        <Icon className="h-3 w-3" strokeWidth={1.9} />
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
                      {stat.value}
                    </p>
                    <p className="mt-1 hidden truncate text-[7px] text-slate-400 sm:block">
                      {stat.helper}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 grid gap-2.5 md:grid-cols-[1fr_1.05fr]">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700/70 dark:bg-[#141f2a]">
                <p className="text-[9px] font-bold text-slate-900 dark:text-white sm:text-[10px]">
                  Actividad reciente
                </p>
                <div className="mt-2.5 space-y-2.5">
                  {activity.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex items-center gap-2">
                        <span
                          className={`rounded-full p-1.5 ${item.iconClass}`}
                        >
                          <Icon className="h-3 w-3" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[8px] font-semibold text-slate-800 dark:text-slate-100 sm:text-[9px]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 truncate text-[7px] text-slate-400">
                            {item.branch}
                          </p>
                        </div>
                        <p className="shrink-0 text-[7px] text-slate-400">
                          {item.time}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700/70 dark:bg-[#141f2a]">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-900 dark:text-white sm:text-[10px]">
                    Reseñas por mes
                  </p>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[7px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    +18.4%
                  </span>
                </div>

                <div className="relative mt-3 h-[132px] sm:h-[156px]">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((line) => (
                      <span
                        key={line}
                        className="block h-px w-full bg-slate-100 dark:bg-slate-700/60"
                      />
                    ))}
                  </div>
                  <svg
                    viewBox="0 0 360 160"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    role="img"
                    aria-label="Gráfico ascendente de reseñas mensuales"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="chartArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 136 C30 115, 42 126, 60 112 S94 78, 116 92 S150 64, 176 68 S214 86, 240 60 S286 48, 352 26 L352 160 L8 160 Z"
                      fill="url(#chartArea)"
                    />
                    <path
                      d="M8 136 C30 115, 42 126, 60 112 S94 78, 116 92 S150 64, 176 68 S214 86, 240 60 S286 48, 352 26"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="352" cy="26" r="5" fill="#2563eb" />
                    <circle
                      cx="352"
                      cy="26"
                      r="10"
                      fill="#2563eb"
                      opacity="0.12"
                    />
                  </svg>
                  <div className="absolute right-0 top-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[7px] shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <span className="block text-slate-400">Junio</span>
                    <strong className="mt-0.5 block text-slate-800 dark:text-white">
                      842 reseñas
                    </strong>
                  </div>
                </div>

                <div className="mt-1 flex justify-between text-[7px] text-slate-400">
                  <span>Ene</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-[#080f16] dark:text-white">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_22%,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_10%_58%,rgba(124,58,237,0.10),transparent_28%),linear-gradient(to_bottom,#ffffff_0%,#fbfdff_62%,#f8fbff_100%)] dark:bg-[radial-gradient(circle_at_82%_22%,rgba(37,99,235,0.14),transparent_30%),radial-gradient(circle_at_10%_58%,rgba(124,58,237,0.10),transparent_28%),linear-gradient(to_bottom,#080f16_0%,#0a121b_62%,#0b141e_100%)]"
          />
          <div
            aria-hidden="true"
            className="landing-grid pointer-events-none absolute inset-0 -z-10 opacity-55 dark:opacity-25"
          />
          <div
            aria-hidden="true"
            className="absolute -left-32 top-[38%] -z-10 h-72 w-72 rounded-full border-[42px] border-blue-100/50 blur-[1px] dark:border-blue-500/5 sm:h-96 sm:w-96"
          />

          <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20 xl:px-12">
            <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-20">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur dark:border-blue-500/20 dark:bg-blue-500/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.10)]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
                    Vasirono para empresas
                  </p>
                </div>

                <h1 className="mt-6 max-w-[760px] text-[clamp(2.65rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 dark:text-white">
                  Panel empresarial con acceso verificado
                  <span className="text-blue-600">.</span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                  Administra tu negocio solo después de pasar el filtro de
                  reclamo, registro o verificación presencial de Vasirono.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/login"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_16px_34px_-16px_rgba(15,23,42,0.75)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100"
                  >
                    <LockKeyhole
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.9}
                    />
                    Entrar al panel
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </Link>

                  <Link
                    href={onboardingUrl}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-5 text-sm font-semibold text-slate-800 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.4)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    <Building2
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.8}
                    />
                    Reclamar o registrar negocio
                  </Link>
                </div>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Acceso protegido
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Identidad empresarial validada
                  </span>
                </div>
              </div>

              <DashboardPreview />
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3 lg:mt-16">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.36)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_54px_-28px_rgba(37,99,235,0.32)] dark:border-slate-700/70 dark:bg-slate-900/65 dark:hover:border-blue-500/30 sm:p-6"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="flex items-start gap-4">
                      <span
                        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${stat.iconClass}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 sm:text-[11px]">
                          {stat.label}
                        </p>
                        <p className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {stat.helper}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative border-y border-slate-200/70 bg-slate-50/70 py-16 dark:border-slate-800 dark:bg-[#0a121b] sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-full w-1/3 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.12),transparent_62%)]"
          />

          <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.42)] backdrop-blur dark:border-slate-700/70 dark:bg-[#101923]/90 sm:p-8 lg:p-10">
              <div className="grid items-stretch gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:gap-10">
                <div className="flex flex-col justify-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                    <Layers3 className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl">
                    Base modular lista para crecer
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                    Esta primera base del proyecto prepara navegación, shell y
                    componentes reutilizables para las vistas del panel.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <article className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.38)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 dark:border-slate-700 dark:bg-[#141f2a] dark:hover:border-blue-500/30">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_12px_28px_-14px_rgba(37,99,235,0.9)]">
                      <UsersRound className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                      Admin company
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Dashboard, sucursales, perfil del negocio, reseñas,
                      analytics, verificaciones y configuración.
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-300">
                      <span>Gestión centralizada</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </article>

                  <article className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.38)] transition duration-200 hover:-translate-y-1 hover:border-violet-200 dark:border-slate-700 dark:bg-[#141f2a] dark:hover:border-violet-500/30">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[0_12px_28px_-14px_rgba(124,58,237,0.9)]">
                      <Box className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                      Escalable por dominios
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Servicios, tipos, schemas, mappers y queries separados por
                      módulo para mantener orden y mantenibilidad.
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-300">
                      <span>Arquitectura sostenible</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-[#080f16] sm:py-20">
          <div className="mx-auto max-w-[1120px] px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
              Tu negocio, administrado con confianza
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Accede a una experiencia diseñada para mantener información,
              sucursales y reputación bajo una gestión empresarial verificada.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(37,99,235,0.9)] transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                Acceder ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={onboardingUrl}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <MapPin className="h-4 w-4" />
                Reclamar mi negocio
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
