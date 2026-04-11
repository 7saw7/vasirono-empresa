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

export const analyticsFiltersSchema = z
  .object({
    from: z.preprocess(toOptionalTrimmedString, z.string().date().optional()),
    to: z.preprocess(toOptionalTrimmedString, z.string().date().optional()),
    branchId: z.preprocess(
      toOptionalInt,
      z.number().int().positive().optional()
    ),
    source: z.preprocess(
      toOptionalTrimmedString,
      z.string().trim().min(1).max(100).optional()
    ),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return data.from <= data.to;
    },
    {
      message: "El rango de fechas es inválido.",
      path: ["to"],
    }
  );