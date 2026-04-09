import { ZodError, ZodSchema } from "zod";
import { AppError } from "@/lib/errors/app-error";

export function parseWithSchema<T>(
  schema: ZodSchema<T>,
  input: unknown,
  message = "Datos inválidos."
): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("VALIDATION_ERROR", message, 400, error.flatten());
    }

    throw error;
  }
}