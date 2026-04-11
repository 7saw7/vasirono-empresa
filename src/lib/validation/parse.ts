import { ZodSchema, ZodError } from "zod";
import { AppError } from "@/lib/errors/app-error";

function mapZodIssues(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";

    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }

    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
}

export function parseWithSchema<T>(
  schema: ZodSchema<T>,
  input: unknown,
  message = "Los datos enviados no son válidos."
): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      message,
      422,
      mapZodIssues(result.error)
    );
  }

  return result.data;
}