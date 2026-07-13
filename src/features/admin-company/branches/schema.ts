import { z } from "zod";
import { parseWithSchema } from "@/lib/validation/parse";
import type {
  BranchContactInput,
  BranchDetail,
  BranchHourExceptionInput,
  BranchListItem,
  BranchScheduleInput,
  BranchServiceAttachInput,
  UpsertBranchInput,
} from "./types";

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

const positiveInt = z.preprocess(toOptionalInt, z.number().int().positive());
const optionalPositiveInt = z.preprocess(toOptionalInt, z.number().int().positive().optional());
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "La hora debe usar formato HH:mm.");
const optionalTime = z.preprocess(toOptionalTrimmedString, timeSchema.optional());

export const branchFiltersSchema = z.object({
  search: z.preprocess(toOptionalTrimmedString, z.string().min(1).optional()),
  status: z.preprocess(toOptionalTrimmedString, z.enum(["active", "inactive"]).optional()),
  districtId: optionalPositiveInt,
});

export const branchRouteParamsSchema = z.object({ branchId: positiveInt });
export const branchContactRouteParamsSchema = z.object({ branchId: positiveInt, contactId: positiveInt });
export const branchScheduleRouteParamsSchema = z.object({ branchId: positiveInt, scheduleId: positiveInt });
export const branchExceptionRouteParamsSchema = z.object({ branchId: positiveInt, exceptionId: positiveInt });
export const branchServiceRouteParamsSchema = z.object({ branchId: positiveInt, serviceId: positiveInt });

export const upsertBranchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().default(""),
  address: z.string().trim().min(5).max(240),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().email("El correo no tiene un formato válido.").optional().or(z.literal("")).default(""),
  districtId: positiveInt,
  isMain: z.boolean(),
  isActive: z.boolean(),
});

export const branchContactInputSchema = z.object({
  contactTypeId: positiveInt,
  value: z.string().trim().min(1, "El valor del contacto es obligatorio.").max(500),
  label: z.preprocess(toOptionalTrimmedString, z.string().max(100).optional()),
  isPrimary: z.boolean(),
  isPublic: z.boolean(),
});

export const branchScheduleInputSchema = z.object({
  scheduleId: optionalPositiveInt,
  dayId: z.preprocess(toOptionalInt, z.number().int().min(1).max(7)),
  opening: optionalTime,
  closing: optionalTime,
  shiftNumber: z.preprocess(toOptionalInt, z.number().int().min(1).max(10)),
}).superRefine((value, ctx) => {
  if (Boolean(value.opening) !== Boolean(value.closing)) {
    ctx.addIssue({ code: "custom", path: ["closing"], message: "Apertura y cierre deben enviarse juntos." });
  }
  if (value.opening && value.closing && value.opening >= value.closing) {
    ctx.addIssue({ code: "custom", path: ["closing"], message: "El cierre debe ser posterior a la apertura." });
  }
});

export const branchHourExceptionInputSchema = z.object({
  exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no es válida."),
  isClosed: z.boolean(),
  opening: optionalTime,
  closing: optionalTime,
  reason: z.preprocess(toOptionalTrimmedString, z.string().max(150).optional()),
  notes: z.preprocess(toOptionalTrimmedString, z.string().max(500).optional()),
}).superRefine((value, ctx) => {
  if (value.isClosed && (value.opening || value.closing)) {
    ctx.addIssue({ code: "custom", path: ["opening"], message: "Un cierre total no debe incluir horas." });
  }
  if (!value.isClosed && (!value.opening || !value.closing)) {
    ctx.addIssue({ code: "custom", path: ["closing"], message: "Un horario especial requiere apertura y cierre." });
  }
  if (value.opening && value.closing && value.opening >= value.closing) {
    ctx.addIssue({ code: "custom", path: ["closing"], message: "El cierre debe ser posterior a la apertura." });
  }
});

export const branchServiceAttachInputSchema = z.object({ serviceId: positiveInt, isAvailable: z.boolean() });
export const branchServiceAvailabilitySchema = z.object({ isAvailable: z.boolean() });

const nullableNumber = z.number().finite().nullable().optional();
const branchListItemSchema = z.object({
  branchId: z.number().int().positive(),
  companyId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  districtId: z.number().int().positive().nullable().optional(),
  districtName: z.string(),
  isMain: z.boolean(),
  isActive: z.boolean(),
  finalScore: nullableNumber,
  visits30d: nullableNumber,
  avgRating90d: nullableNumber,
  reviews90d: nullableNumber,
});

const branchContactItemSchema = z.object({
  contactId: z.number().int().positive(), contactTypeId: z.number().int().positive(), typeLabel: z.string().min(1),
  value: z.string(), label: z.string().nullable().optional(), isPrimary: z.boolean(), isPublic: z.boolean(),
});
const branchScheduleItemSchema = z.object({
  scheduleId: z.number().int().positive(), dayId: z.number().int().min(1).max(7), dayName: z.string().min(1),
  isoNumber: z.number().int().min(1).max(7), opening: z.string().nullable().optional(), closing: z.string().nullable().optional(),
  shiftNumber: z.number().int().positive(),
});
const branchServiceItemSchema = z.object({ serviceId: z.number().int().positive(), code: z.string(), name: z.string().min(1), isAvailable: z.boolean() });
const branchMediaItemSchema = z.object({ mediaId: z.number().int().positive(), typeLabel: z.string().min(1), url: z.string().min(1) });
const branchDetailSchema = branchListItemSchema.extend({
  lat: z.number().finite().nullable().optional(), lon: z.number().finite().nullable().optional(),
  schedules: z.array(branchScheduleItemSchema), services: z.array(branchServiceItemSchema),
  contacts: z.array(branchContactItemSchema), media: z.array(branchMediaItemSchema),
});
const districtOptionSchema = z.object({ id: z.number().int().positive(), name: z.string().min(1) });

export type BranchFiltersSchema = z.infer<typeof branchFiltersSchema>;
export type BranchRouteParamsSchema = z.infer<typeof branchRouteParamsSchema>;
export type UpsertBranchSchema = z.infer<typeof upsertBranchSchema>;

export const validateUpsertBranchInput = (input: unknown): UpsertBranchInput => parseWithSchema(upsertBranchSchema, input, "Datos inválidos para la sucursal.");
export const validateBranchFilters = (input: unknown) => parseWithSchema(branchFiltersSchema, input, "Los filtros de sucursales no son válidos.");
export const validateBranchRouteParams = (input: unknown) => parseWithSchema(branchRouteParamsSchema, input, "Los parámetros de la ruta no son válidos.");
export const validateBranchList = (input: unknown): BranchListItem[] => parseWithSchema(z.array(branchListItemSchema), input, "La lista de sucursales es inválida.");
export const validateBranchDetail = (input: unknown): BranchDetail => parseWithSchema(branchDetailSchema, input, "El detalle de sucursal es inválido.");
export const validateDistrictOptions = (input: unknown) => parseWithSchema(z.array(districtOptionSchema), input, "El catálogo de distritos es inválido.");
export const validateBranchContactInput = (input: unknown): BranchContactInput => parseWithSchema(branchContactInputSchema, input, "El contacto no es válido.");
export const validateBranchScheduleInput = (input: unknown): BranchScheduleInput => parseWithSchema(branchScheduleInputSchema, input, "El horario no es válido.");
export const validateBranchHourExceptionInput = (input: unknown): BranchHourExceptionInput => parseWithSchema(branchHourExceptionInputSchema, input, "La excepción horaria no es válida.");
export const validateBranchServiceAttachInput = (input: unknown): BranchServiceAttachInput => parseWithSchema(branchServiceAttachInputSchema, input, "El servicio no es válido.");
