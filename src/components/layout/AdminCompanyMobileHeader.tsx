"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminCompanyNav } from "./AdminCompanyNav";

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
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-300">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Vasirono
            </p>
            <p className="truncate text-base font-semibold tracking-tight text-neutral-950">
              Admin Company
            </p>
          </Link>

          <button
            type="button"
            aria-label="Abrir menú del panel"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-950 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel empresa">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />

          <aside className="relative flex h-full w-[min(88vw,340px)] flex-col border-r border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5">
              <Link href="/dashboard" className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-300">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  Vasirono
                </p>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight text-neutral-950">
                  Admin Company
                </p>
              </Link>

              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-950 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <AdminCompanyNav compact onNavigate={() => setOpen(false)} />
            </div>

            <div className="border-t border-neutral-200 p-4">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Menú rápido
                </p>
                <p className="mt-2 text-sm leading-5 text-neutral-600">
                  Usa este panel para administrar tu negocio desde móvil o escritorio.
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
