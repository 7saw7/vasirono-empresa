import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";

function BrandMark() {
  return (
    <span
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute left-[14%] top-[13%] h-[72%] w-[42%] -skew-x-[20deg] rounded-[4px] bg-gradient-to-b from-blue-500 to-indigo-600" />
      <span className="absolute right-[14%] top-[13%] h-[72%] w-[42%] skew-x-[20deg] rounded-[4px] bg-gradient-to-b from-sky-400 to-blue-500" />
      <span className="absolute bottom-[11%] left-1/2 h-[18%] w-[18%] -translate-x-1/2 rotate-45 rounded-[2px] bg-indigo-600" />
    </span>
  );
}

export function Footer() {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#080f16]">
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
            >
              <BrandMark />
              <span className="text-base font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
                Vasirono
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Plataforma de descubrimiento y gestión empresarial con acceso
              verificado.
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400"
            aria-label="Navegación del pie de página"
          >
            <Link
              href="/"
              className="transition hover:text-slate-950 dark:hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href={onboardingUrl}
              className="inline-flex items-center gap-1 transition hover:text-slate-950 dark:hover:text-white"
            >
              Reclamar negocio
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/planes"
              className="transition hover:text-slate-950 dark:hover:text-white"
            >
              Planes
            </Link>
            <Link
              href="/login"
              className="transition hover:text-slate-950 dark:hover:text-white"
            >
              Acceder
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200/80 pt-6 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Vasirono. Todos los derechos
            reservados.
          </p>
          <p>Diseñado para una gestión empresarial confiable.</p>
        </div>
      </div>
    </footer>
  );
}
