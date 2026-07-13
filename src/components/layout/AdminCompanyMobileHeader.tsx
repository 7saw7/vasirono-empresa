"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { Building2, Menu, X } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
=======
import { Menu, X } from "lucide-react";
>>>>>>> 4406bf1 (delete avatar en header)
import { AdminCompanyNav } from "./AdminCompanyNav";
import { AdminCompanyLogoutButton } from "./AdminCompanyLogoutButton";
import { ThemeToggle } from "./ThemeToggle";

export function AdminCompanyMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-[#0b1118]/90">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-sm">
              <Building2 className="h-[19px] w-[19px]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold tracking-tight text-slate-950 dark:text-white">
                Vasirono
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Business panel
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button
              type="button"
              aria-label="Abrir menú del panel"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-400"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel empresa">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />

          <aside className="relative flex h-full w-[min(88vw,340px)] flex-col border-r border-slate-200 bg-[#f8fafc] shadow-2xl dark:border-slate-800 dark:bg-[#080e14]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white">
                  <Building2 className="h-[19px] w-[19px]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold text-slate-950 dark:text-white">Vasirono</span>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Business panel</span>
                </span>
              </Link>

              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
              <AdminCompanyNav compact onNavigate={() => setOpen(false)} />
            </div>

<<<<<<< HEAD
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/70">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {session.name}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {session.email}
                </p>
                <AdminCompanyLogoutButton compact />
              </div>
=======
            <div className="border-t border-neutral-200 p-4">
              <AdminCompanyLogoutButton compact />
>>>>>>> 4406bf1 (delete avatar en header)
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
