"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_COMPANY_NAV } from "@/config/nav/admin-company-nav";
import { cn } from "@/lib/utils/cn";

export function AdminCompanySidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white xl:flex xl:min-h-screen xl:flex-col">
      <div className="border-b border-neutral-200 px-6 py-6">
        <Link href="/dashboard" className="block">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-400">
            Vasirono
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
            Admin Company
          </p>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {ADMIN_COMPANY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}