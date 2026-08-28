import { z } from "zod";

export const upgradeCheckoutSchema = z.object({
  planCode: z.enum([
    "free",
    "esencial",
    "pro",
    "impulso",
    "premium",
    "estrategico",
  ]),
  idempotencyKey: z.string().trim().min(8).max(200),
  promotionCode: z.string().trim().min(4).max(64).optional(),
});

export type UpgradeCheckoutSchema = z.infer<typeof upgradeCheckoutSchema>;
