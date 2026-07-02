import { z } from "zod";

const optionalDateString = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());

export const upgradeCheckoutSchema = z.object({
  planId: z.coerce.number().int().positive(),
  paymentMethodId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive().max(999999999),
  startDate: optionalDateString,
  endDate: optionalDateString,
  idempotencyKey: z.string().trim().min(8).max(200).optional(),
});

export type UpgradeCheckoutSchema = z.infer<typeof upgradeCheckoutSchema>;
