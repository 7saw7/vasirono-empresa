import type { NextRequest } from "next/server";
import { AppError } from "@/lib/errors/app-error";

export async function readJsonBody(
  request: NextRequest,
  message = "El cuerpo JSON no es válido.",
): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError("INVALID_JSON", message, 400);
  }
}
