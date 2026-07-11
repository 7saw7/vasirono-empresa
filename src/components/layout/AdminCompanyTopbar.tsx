import Link from "next/link";
import { Bell, Building2, PanelLeft, Plus } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { ThemeToggle } from "./ThemeToggle";

type AdminCompanyTopbarProps = {
  session: SessionUser;
};

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "VA";
}

export function AdminCompanyTopbar({ session }: AdminCompanyTopbarProps) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-slate-200/90 bg-white/90 px-5 backdrop-blur-xl lg:flex dark:border-slate-800 dark:bg-[#0b1118]/90">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400">
          <PanelLeft className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <span className="h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
            Panel empresarial
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/sucursales/nueva"
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-sky-600 px-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(2,132,199,0.24)] transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva sucursal
        </Link>

        <button
          type="button"
          aria-label="Notificaciones"
          title="Notificaciones"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-400"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <ThemeToggle />

        <div className="ml-1 flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-xs font-bold text-white shadow-sm">
            {getInitials(session.name)}
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="max-w-40 truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
              {session.name}
            </p>
            <p className="max-w-40 truncate text-[11px] text-slate-500 dark:text-slate-400">
              {session.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
