"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_COMPANY_NAV } from "@/config/nav/admin-company-nav";
import { cn } from "@/lib/utils/cn";

type AdminCompanyNavProps = {
  onNavigate?: () => void;
  compact?: boolean;
};

export function AdminCompanyNav({ onNavigate, compact = false }: AdminCompanyNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación del panel empresa" className="w-full">
      <ul className={cn("space-y-1.5", compact && "space-y-1")}> 
        {ADMIN_COMPANY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
                style={isActive ? { color: "#fafafa" } : undefined}
                className={cn(
                  "group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-neutral-300",
                  isActive
                    ? "bg-neutral-950 text-neutral-50 shadow-sm shadow-neutral-950/10"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                  compact && "rounded-xl px-3 py-2.5"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0 text-current transition-colors",
                    isActive ? "text-neutral-50" : "text-neutral-500 group-hover:text-neutral-900"
                  )}
                  style={isActive ? { color: "#fafafa" } : undefined}
                />
                <span className="truncate text-current" style={isActive ? { color: "#fafafa" } : undefined}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
