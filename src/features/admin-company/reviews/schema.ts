import { z } from "zod";

function toOptionalTrimmedString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalInt(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : value;
}

function toOptionalBoolean(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return value;
}

export const reviewFiltersSchema = z.object({
  search: z.preprocess(toOptionalTrimmedString, z.string().min(1).optional()),
  rating: z.preprocess(
    toOptionalInt,
    z.number().int().min(1).max(5).optional()
  ),
  branchId: z.preprocess(
    toOptionalInt,
    z.number().int().positive().optional()
  ),
  responded: z.preprocess(toOptionalBoolean, z.boolean().optional()),
  validated: z.preprocess(toOptionalBoolean, z.boolean().optional()),
});

export const reviewResponseParamsSchema = z.object({
  reviewId: z.preprocess(
    toOptionalInt,
    z.number().int().positive("El reviewId debe ser un entero positivo.")
  ),
});

function toReviewResponseInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const row = value as Record<string, unknown>;
  const candidate =
    row.responseText ?? row.response_text ?? row.text ?? row.content ?? row.message;

  return {
    responseText: typeof candidate === "string" ? candidate.trim() : candidate,
  };
}

export const upsertReviewResponseSchema = z.preprocess(
  toReviewResponseInput,
  z.object({
    responseText: z
      .string({ required_error: "La respuesta es obligatoria." })
      .trim()
      .min(3, "La respuesta debe tener al menos 3 caracteres.")
      .max(2000, "La respuesta no debe superar los 2000 caracteres."),
  })
);

export type ReviewFiltersSchema = z.infer<typeof reviewFiltersSchema>;
export type ReviewResponseParamsSchema = z.infer<
  typeof reviewResponseParamsSchema
>;
export type UpsertReviewResponseSchema = z.infer<
  typeof upsertReviewResponseSchema
>;