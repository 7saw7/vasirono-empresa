import { AppError } from "@/lib/errors/app-error";

type PgLikeError = {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  message?: string;
};

function isPgLikeError(error: unknown): error is PgLikeError {
  return !!error && typeof error === "object";
}

export function mapDatabaseError(error: unknown): AppError {
  if (!isPgLikeError(error)) {
    return new AppError(
      "DATABASE_ERROR",
      "Ocurrió un problema al acceder a la base de datos.",
      500
    );
  }

  switch (error.code) {
    case "23505":
      return new AppError(
        "DB_UNIQUE_VIOLATION",
        "Ya existe un registro con esos datos.",
        409
      );

    case "23503":
      return new AppError(
        "DB_FOREIGN_KEY_VIOLATION",
        "La operación referencia datos inexistentes o no permitidos.",
        409
      );

    case "23502":
      return new AppError(
        "DB_NOT_NULL_VIOLATION",
        "Faltan campos obligatorios para completar la operación.",
        400
      );

    case "23514":
      return new AppError(
        "DB_CHECK_VIOLATION",
        "Uno o más datos no cumplen las reglas del sistema.",
        400
      );

    case "22P02":
      return new AppError(
        "DB_INVALID_TEXT_REPRESENTATION",
        "Se envió un valor con formato inválido.",
        400
      );

    case "22001":
      return new AppError(
        "DB_VALUE_TOO_LONG",
        "Uno de los campos supera el tamaño permitido.",
        400
      );

    case "40001":
      return new AppError(
        "DB_SERIALIZATION_FAILURE",
        "La operación no pudo completarse por concurrencia. Intenta nuevamente.",
        409
      );

    case "40P01":
      return new AppError(
        "DB_DEADLOCK",
        "La operación no pudo completarse por conflicto interno. Intenta nuevamente.",
        409
      );

    case "57014":
      return new AppError(
        "DB_QUERY_CANCELED",
        "La consulta tardó demasiado y fue cancelada.",
        504
      );

    default:
      return new AppError(
        "DATABASE_ERROR",
        "Ocurrió un problema al acceder a la base de datos.",
        500
      );
  }
}