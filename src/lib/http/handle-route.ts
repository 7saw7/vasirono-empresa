import { NextResponse } from "next/server";
import { AppError, isAppError } from "@/lib/errors/app-error";
import { fail } from "./api-response";

export async function handleRoute<T>(handler: () => Promise<T>) {
  try {
    const data = await handler();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json(
        fail(error.code, error.message, error.details),
        { status: error.status }
      );
    }

    console.error("[API_ERROR]", error);

    return NextResponse.json(
      fail("INTERNAL_ERROR", "Ocurrió un error interno inesperado."),
      { status: 500 }
    );
  }
}

export function assertOrThrow(
  condition: unknown,
  error: AppError
): asserts condition {
  if (!condition) {
    throw error;
  }
}