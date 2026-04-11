export const STATUS_TONES = {
  default: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
} as const;

export type StatusTone = (typeof STATUS_TONES)[keyof typeof STATUS_TONES];

export const COMPANY_VERIFICATION_STATUSES = {
  pending: "Pendiente",
  inReview: "En revisión",
  verified: "Verificada",
  rejected: "Rechazada",
} as const;

export const BRANCH_OPERATION_STATUSES = {
  active: "Activa",
  inactive: "Inactiva",
} as const;

export const REVIEW_RESPONSE_STATUSES = {
  replied: "Respondida",
  pending: "Pendiente",
} as const;