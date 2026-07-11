"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

type AdminCompanyLogoutButtonProps = {
  compact?: boolean;
};

export function AdminCompanyLogoutButton({
  compact = false,
}: AdminCompanyLogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } finally {
      window.location.replace("/login?logout=1");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={
        compact
          ? "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-red-900/70 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          : "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500"
      }
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
