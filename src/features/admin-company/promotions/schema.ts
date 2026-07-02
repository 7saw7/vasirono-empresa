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

export const promotionFormSchema = z
  .object({
    branchId: z.coerce.number().int().positive("Selecciona una sucursal."),
    title: z.string("El título es obligatorio.").trim().min(3, "El título debe tener al menos 3 caracteres.").max(120),
    description: nullableText.optional(),
    terms: nullableText.optional(),
    discountPercent: nullablePercent.optional(),
    startDate: nullableDate.optional(),
    endDate: nullableDate.optional(),
    active: z.coerce.boolean().optional().default(false),
    coverUrl: nullableText.optional(),
    maxRedemptions: nullablePositiveInt.optional(),
    maxRedemptionsPerUser: z.coerce.number().int().positive().optional().default(1),
    requiresStaffValidation: z.coerce.boolean().optional().default(true),
  })
  .refine((value) => {
    if (!value.startDate || !value.endDate) return true;
    return new Date(value.endDate) >= new Date(value.startDate);
  }, {
    path: ["endDate"],
    message: "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
  });

export type PromotionFormSchemaInput = z.input<typeof promotionFormSchema>;
export type PromotionFormSchemaOutput = z.output<typeof promotionFormSchema>;

export function validatePromotionFormInput(input: unknown): PromotionFormSchemaOutput {
  return promotionFormSchema.parse(input);
}
