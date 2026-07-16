import { z } from "zod";

const nullableText = (maxLength: number, message: string) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }, z.string().max(maxLength, message).nullable());

const nullableUrl = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}, z.string().url("La portada debe ser una URL válida.").max(2048).nullable());

const nullablePositiveInt = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive().nullable());

const optionalPositiveInt = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive().optional());

const requiredPositiveInt = z.preprocess((value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive());

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

const optionalTrimmedText = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}, z.string().max(200).optional());

const optionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return value;
}, z.boolean().optional());

export const promotionStatusSchema = z.enum([
  "draft",
  "pending_review",
  "approved",
  "paused",
  "rejected",
  "expired",
  "deleted",
]);

const contentFields = {
  title: z
    .string("El título es obligatorio.")
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(120, "El título no debe superar 120 caracteres."),
  description: nullableText(
    1000,
    "La descripción no debe superar 1000 caracteres.",
  ).optional(),
  terms: nullableText(
    2000,
    "Los términos no deben superar 2000 caracteres.",
  ).optional(),
  discountPercent: nullablePercent.optional(),
  startDate: nullableDate.optional(),
  endDate: nullableDate.optional(),
  coverUrl: nullableUrl.optional(),
  maxRedemptions: nullablePositiveInt.optional(),
  maxRedemptionsPerUser: z.coerce.number().int().positive().optional().default(1),
  requiresStaffValidation: z.coerce.boolean().optional().default(true),
};

function dateRangeIsValid(value: {
  startDate?: string | null;
  endDate?: string | null;
}) {
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

export const promotionListFiltersSchema = z.object({
  page: optionalPositiveInt.default(1),
  pageSize: optionalPositiveInt
    .default(20)
    .pipe(z.number().int().min(1).max(100)),
  search: optionalTrimmedText,
  branchId: optionalPositiveInt,
  status: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim();
    return normalized || undefined;
  }, promotionStatusSchema.optional()),
  active: optionalBoolean,
});

export const promotionRouteParamsSchema = z.object({
  promotionId: requiredPositiveInt,
});

export const promotionRedemptionCodeParamsSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "El código debe tener al menos 4 caracteres.")
    .max(32, "El código no debe superar 32 caracteres.")
    .transform((value) => value.toUpperCase()),
});

export const promotionRedemptionValidationSchema = z.object({
  branchId: optionalPositiveInt,
});

export const promotionRedemptionCancellationSchema = z.object({
  reason: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim();
    return normalized || undefined;
  }, z.string().max(500, "El motivo no debe superar 500 caracteres.").optional()),
});

export const promotionCoverFieldsSchema = z.object({
  altText: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim();
    return normalized || undefined;
  }, z.string().max(300, "El texto alternativo no debe superar 300 caracteres.").optional()),
});

export type PromotionCreateSchemaOutput = z.output<typeof promotionCreateSchema>;
export type PromotionUpdateSchemaOutput = z.output<typeof promotionUpdateSchema>;

export function validatePromotionCreateInput(
  input: unknown,
): PromotionCreateSchemaOutput {
  return promotionCreateSchema.parse(input);
}

export function validatePromotionUpdateInput(
  input: unknown,
): PromotionUpdateSchemaOutput {
  return promotionUpdateSchema.parse(input);
}
