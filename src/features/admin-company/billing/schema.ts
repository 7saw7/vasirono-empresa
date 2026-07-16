import { z } from "zod";

export const upgradeCheckoutSchema = z.object({
  planCode: z.enum(["free", "pro", "premium"]),
  idempotencyKey: z.string().trim().min(8).max(200),
});

export type UpgradeCheckoutSchema = z.infer<typeof upgradeCheckoutSchema>;
