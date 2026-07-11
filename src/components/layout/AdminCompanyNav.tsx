"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_COMPANY_NAV, type AdminCompanyNavItem } from "@/config/nav/admin-company-nav";
import { cn } from "@/lib/utils/cn";

type AdminCompanyNavProps = {
  onNavigate?: () => void;
  compact?: boolean;
};

type NavGroup = {
  label: string;
  items: AdminCompanyNavItem[];
};

const GROUPS: NavGroup[] = [
  {
    label: "Resumen",
    items: ADMIN_COMPANY_NAV.filter((item) => item.href === "/dashboard"),
  },
  {
    label: "Gestión del negocio",
    items: ADMIN_COMPANY_NAV.filter((item) =>
      [
        "/sucursales",
        "/perfil-negocio",
        "/resenias",
        "/analytics",
        "/verificaciones",
      ].includes(item.href)
    ),
  },
  {
    label: "Crecimiento",
    items: ADMIN_COMPANY_NAV.filter((item) =>
      ["/promociones", "/galeria", "/equipo"].includes(item.href)
    ),
  },
  {
    label: "Cuenta",
    items: ADMIN_COMPANY_NAV.filter((item) =>
      ["/plan", "/configuracion"].includes(item.href)
    ),
  },
];

export function AdminCompanyNav({ onNavigate, compact = false }: AdminCompanyNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación del panel empresa" className="w-full">
      <div className={cn("space-y-6", compact && "space-y-5")}>
        {GROUPS.map((group, groupIndex) => {
          const groupId = `admin-nav-group-${groupIndex}`;

          return (
          <section key={group.label} aria-labelledby={groupId}>
            <p
              id={groupId}
              className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500"
            >
              {group.label}
            </p>

            <ul className="space-y-1">
              {group.items.map((item) => {
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
                      className={cn(
                        "group relative flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-500/35",
                        isActive
                          ? "bg-sky-100/80 text-sky-800 shadow-[inset_3px_0_0_#0284c7] dark:bg-sky-950/55 dark:text-sky-300 dark:shadow-[inset_3px_0_0_#38bdf8]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
                        compact && "py-2.5"
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "h-[17px] w-[17px] shrink-0 transition-colors",
                          isActive
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-slate-500 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          );
        })}
      </div>
    </nav>
  );
}
