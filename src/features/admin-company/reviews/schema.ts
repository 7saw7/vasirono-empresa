import { z } from "zod";

export const reviewFiltersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  branchId: z.coerce.number().int().positive().optional(),
  responded: z.coerce.boolean().optional(),
  validated: z.coerce.boolean().optional(),
});

export const upsertReviewResponseSchema = z.object({
  responseText: z
    .string()
    .trim()
    .min(8, "La respuesta debe tener al menos 8 caracteres.")
    .max(1500, "La respuesta no debe superar los 1500 caracteres."),
});

export type ReviewFiltersSchema = z.infer<typeof reviewFiltersSchema>;
export type UpsertReviewResponseSchema = z.infer<
  typeof upsertReviewResponseSchema
>;