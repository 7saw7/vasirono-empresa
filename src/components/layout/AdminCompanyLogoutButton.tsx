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
          ? "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-wait disabled:opacity-60"
          : "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
      }
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
