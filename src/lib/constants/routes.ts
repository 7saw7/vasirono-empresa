export const PUBLIC_ROUTES = {
  home: "/",
  plans: "/planes",
  login: "/login",
  recoverPassword: "/recuperar-clave",
  activateAccount: "/activar-cuenta",
  invitationExpired: "/invitacion-expirada",
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
  businessInvitationPreview: "/api/auth/business-invitations/preview",
  businessInvitationAccept: "/api/auth/business-invitations/accept",
  adminCompanyDashboard: "/api/admin-company/dashboard",
  adminCompanyCompany: "/api/admin-company/company",
  adminCompanyBranches: "/api/admin-company/branches",
  adminCompanyReviews: "/api/admin-company/reviews",
  adminCompanyAnalyticsOverview: "/api/admin-company/analytics/overview",
} as const;