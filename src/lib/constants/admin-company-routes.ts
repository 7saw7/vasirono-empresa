import { ADMIN_COMPANY_ROUTES } from "./routes";

export const ADMIN_COMPANY_ROUTE_ITEMS = [
  {
    label: "Dashboard",
    href: ADMIN_COMPANY_ROUTES.DASHBOARD,
    icon: "layout-dashboard",
  },
  {
    label: "Sucursales",
    href: ADMIN_COMPANY_ROUTES.BRANCHES,
    icon: "store",
  },
  {
    label: "Perfil del negocio",
    href: ADMIN_COMPANY_ROUTES.COMPANY_PROFILE,
    icon: "building-2",
  },
  {
    label: "Reseñas",
    href: ADMIN_COMPANY_ROUTES.REVIEWS,
    icon: "message-square",
  },
  {
    label: "Analytics",
    href: ADMIN_COMPANY_ROUTES.ANALYTICS,
    icon: "bar-chart-3",
  },
  {
    label: "Verificaciones",
    href: ADMIN_COMPANY_ROUTES.VERIFICATIONS,
    icon: "badge-check",
  },
  {
    label: "Configuración",
    href: ADMIN_COMPANY_ROUTES.SETTINGS,
    icon: "settings",
  },
] as const;