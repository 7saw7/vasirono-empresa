import Link from "next/link";
import { Building2 } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { AdminCompanyNav } from "./AdminCompanyNav";
import { AdminCompanyLogoutButton } from "./AdminCompanyLogoutButton";

type AdminCompanySidebarProps = {
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

export function AdminCompanySidebar({ session }: AdminCompanySidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-[#f8fafc] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col dark:border-slate-800 dark:bg-[#080e14]">
      <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
        <Link
          href="/dashboard"
          className="group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-[0_8px_24px_rgba(2,132,199,0.25)] transition-transform group-hover:-translate-y-0.5">
            <Building2 className="h-[19px] w-[19px]" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Vasirono
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Business panel
            </span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <AdminCompanyNav />
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-[11px] font-bold text-white">
              {getInitials(session.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {session.name}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {session.email}
              </p>
            </div>
          </div>
          <AdminCompanyLogoutButton compact />
        </div>
      </div>
    </aside>
  );
}
