"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Store,
} from "lucide-react";
import { ADMIN_COMPANY_NAV } from "@/config/nav/admin-company-nav";
import { cn } from "@/lib/utils/cn";

const ICONS = {
  "layout-dashboard": LayoutDashboard,
  store: Store,
  "building-2": Building2,
  "message-square": MessageSquare,
  "bar-chart-3": BarChart3,
  "badge-check": BadgeCheck,
  settings: Settings,
};

export function AdminCompanySidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-neutral-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-neutral-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Vasirono
          </p>
          <h2 className="mt-2 text-lg font-semibold text-neutral-950">
            Panel empresa
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Gestiona tu presencia y rendimiento.
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {ADMIN_COMPANY_NAV.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            const Icon = ICONS[item.icon as keyof typeof ICONS];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}