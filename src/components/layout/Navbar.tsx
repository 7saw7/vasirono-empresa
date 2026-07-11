import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";

function BrandMark() {
  return (
    <span
      className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute left-[14%] top-[13%] h-[72%] w-[42%] -skew-x-[20deg] rounded-[4px] bg-gradient-to-b from-blue-500 to-indigo-600" />
      <span className="absolute right-[14%] top-[13%] h-[72%] w-[42%] skew-x-[20deg] rounded-[4px] bg-gradient-to-b from-sky-400 to-blue-500" />
      <span className="absolute bottom-[11%] left-1/2 h-[18%] w-[18%] -translate-x-1/2 rotate-45 rounded-[2px] bg-indigo-600" />
    </span>
  );
}

export function Navbar() {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/90 dark:bg-[#080f16]/82">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
          aria-label="Vasirono, ir al inicio"
        >
          <BrandMark />
          <span className="text-lg font-bold tracking-[-0.035em] text-slate-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
            Vasirono
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Navegación principal"
          >
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href={onboardingUrl}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Reclamar negocio
            </Link>
          </nav>

          <ThemeToggle />

          <Link
            href="/login"
            className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(37,99,235,0.9)] transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 hover:shadow-[0_16px_34px_-16px_rgba(37,99,235,0.95)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45 focus-visible:ring-offset-2 dark:border-blue-400/20 dark:from-blue-500 dark:via-blue-500 dark:to-indigo-500 dark:text-white dark:hover:from-blue-400 dark:hover:via-blue-500 dark:hover:to-indigo-400 dark:focus-visible:ring-offset-[#080f16] sm:px-4"
          >
            <span>Acceder</span>
            <ArrowRight
              className="hidden h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:block"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
