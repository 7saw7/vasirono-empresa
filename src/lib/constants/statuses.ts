export const ENTITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  VERIFIED: "verified",
} as const;

export type EntityStatus =
  (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];