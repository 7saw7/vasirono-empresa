import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import { AdminCompanyNav } from "./AdminCompanyNav";
import { AdminCompanyLogoutButton } from "./AdminCompanyLogoutButton";

type AdminCompanySidebarProps = {
  session: SessionUser;
};

export function AdminCompanySidebar({ session }: AdminCompanySidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="border-b border-neutral-200 px-6 py-6">
        <Link href="/dashboard" className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-300">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Vasirono
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
            Admin Company
          </p>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AdminCompanyNav />
      </div>

      <div className="border-t border-neutral-200 p-4">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Sesión empresa
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-neutral-950">
            {session.email}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Empresa activa: {session.companyId ?? "sin empresa"}
          </p>
          <AdminCompanyLogoutButton />
        </div>
      </div>
    </aside>
  );
}
