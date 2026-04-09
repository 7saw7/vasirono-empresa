import { z } from "zod";

export const analyticsFiltersSchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  source: z.string().trim().min(1).max(100).optional(),
});