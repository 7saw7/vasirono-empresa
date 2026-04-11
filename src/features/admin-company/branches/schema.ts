import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import type {
  BranchDetail,
  BranchListItem,
  UpsertBranchInput,
} from "./types";
import { parseWithSchema } from "@/lib/validation/parse";

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

export const branchFiltersSchema = z.object({
  search: z.preprocess(toOptionalTrimmedString, z.string().min(1).optional()),
  status: z
    .preprocess(toOptionalTrimmedString, z.enum(["active", "inactive"]).optional()),
  districtId: z.preprocess(
    toOptionalInt,
    z.number().int().positive().optional()
  ),
});

export const branchRouteParamsSchema = z.object({
  branchId: z.preprocess(
    toOptionalInt,
    z.number().int().positive("El branchId debe ser un entero positivo.")
  ),
});

export const upsertBranchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no debe superar los 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no debe superar los 500 caracteres.")
    .optional()
    .default(""),
  address: z
    .string()
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres.")
    .max(240, "La dirección no debe superar los 240 caracteres."),
  phone: z
    .string()
    .trim()
    .max(40, "El teléfono no debe superar los 40 caracteres.")
    .optional()
    .default(""),
  email: z
    .string()
    .trim()
    .email("El correo no tiene un formato válido.")
    .optional()
    .or(z.literal(""))
    .default(""),
  districtId: z.preprocess(
    toOptionalInt,
    z
      .number()
      .int()
      .positive("El distrito es obligatorio.")
  ),
  isMain: z.boolean(),
  isActive: z.boolean(),
});

export type BranchFiltersSchema = z.infer<typeof branchFiltersSchema>;
export type BranchRouteParamsSchema = z.infer<typeof branchRouteParamsSchema>;
export type UpsertBranchSchema = z.infer<typeof upsertBranchSchema>;

export function validateUpsertBranchInput(input: unknown): UpsertBranchInput {
  return parseWithSchema(
    upsertBranchSchema,
    input,
    "Datos inválidos para la sucursal."
  );
}

export function validateBranchFilters(input: unknown): BranchFiltersSchema {
  return parseWithSchema(
    branchFiltersSchema,
    input,
    "Los filtros de sucursales no son válidos."
  );
}

export function validateBranchRouteParams(
  input: unknown
): BranchRouteParamsSchema {
  return parseWithSchema(
    branchRouteParamsSchema,
    input,
    "Los parámetros de la ruta no son válidos."
  );
}

export function validateBranchList(input: unknown): BranchListItem[] {
  if (!Array.isArray(input)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "La lista de sucursales es inválida.",
      422
    );
  }

  return input as BranchListItem[];
}

export function validateBranchDetail(input: unknown): BranchDetail {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "El detalle de sucursal es inválido.",
      422
    );
  }

  return input as BranchDetail;
}