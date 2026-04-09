export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  RECOVER_PASSWORD: "/recuperar-clave",
} as const;

export const ADMIN_COMPANY_ROUTES = {
  DASHBOARD: "/dashboard",
  BRANCHES: "/sucursales",
  COMPANY_PROFILE: "/perfil-negocio",
  REVIEWS: "/resenias",
  ANALYTICS: "/analytics",
  VERIFICATIONS: "/verificaciones",
  SETTINGS: "/configuracion",
} as const;