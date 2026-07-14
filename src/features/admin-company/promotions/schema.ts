import { z } from "zod";

const nullableText = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}, z.string().nullable());

const nullablePositiveInt = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive().nullable());

const nullablePercent = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().min(0).max(100).nullable());

const nullableDate = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return value;
  return value.trim() || null;
}, z.string().date().nullable());

const contentFields = {
  title: z.string("El título es obligatorio.").trim().min(3, "El título debe tener al menos 3 caracteres.").max(120),
  description: nullableText.optional(),
  terms: nullableText.optional(),
  discountPercent: nullablePercent.optional(),
  startDate: nullableDate.optional(),
  endDate: nullableDate.optional(),
  coverUrl: nullableText.optional(),
  maxRedemptions: nullablePositiveInt.optional(),
  maxRedemptionsPerUser: z.coerce.number().int().positive().optional().default(1),
  requiresStaffValidation: z.coerce.boolean().optional().default(true),
};

function dateRangeIsValid(value: { startDate?: string | null; endDate?: string | null }) {
  if (!value.startDate || !value.endDate) return true;
  return new Date(value.endDate) >= new Date(value.startDate);
}

export const promotionCreateSchema = z
  .object({
    branchId: z.coerce.number().int().positive("Selecciona una sucursal."),
    ...contentFields,
  })
  .refine(dateRangeIsValid, {
    path: ["endDate"],
    message: "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
  });

export const promotionUpdateSchema = z
  .object({
    title: contentFields.title.optional(),
    description: contentFields.description,
    terms: contentFields.terms,
    discountPercent: contentFields.discountPercent,
    startDate: contentFields.startDate,
    endDate: contentFields.endDate,
    coverUrl: contentFields.coverUrl,
    maxRedemptions: contentFields.maxRedemptions,
    maxRedemptionsPerUser: z.coerce.number().int().positive().optional(),
    requiresStaffValidation: z.coerce.boolean().optional(),
  })
  .refine(dateRangeIsValid, {
    path: ["endDate"],
    message: "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
  });

export type PromotionCreateSchemaOutput = z.output<typeof promotionCreateSchema>;
export type PromotionUpdateSchemaOutput = z.output<typeof promotionUpdateSchema>;

export function validatePromotionCreateInput(input: unknown): PromotionCreateSchemaOutput {
  return promotionCreateSchema.parse(input);
}

export function validatePromotionUpdateInput(input: unknown): PromotionUpdateSchemaOutput {
  return promotionUpdateSchema.parse(input);
}
