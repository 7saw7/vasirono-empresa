export const PUBLIC_ROUTES = {
  home: "/",
  plans: "/planes",
  login: "/login",
  recoverPassword: "/recuperar-clave",
} as const;

export const ADMIN_COMPANY_ROUTES = {
  dashboard: "/dashboard",
  branches: "/sucursales",
  companyProfile: "/perfil-negocio",
  reviews: "/resenias",
  analytics: "/analytics",
  verifications: "/verificaciones",
  settings: "/configuracion",
} as const;

export const API_ROUTES = {
  authLogin: "/api/auth/login",
  authLogout: "/api/auth/logout",
  authMe: "/api/auth/me",
  adminCompanyDashboard: "/api/admin-company/dashboard",
  adminCompanyCompany: "/api/admin-company/company",
  adminCompanyBranches: "/api/admin-company/branches",
  adminCompanyReviews: "/api/admin-company/reviews",
  adminCompanyAnalyticsOverview: "/api/admin-company/analytics/overview",
} as const;