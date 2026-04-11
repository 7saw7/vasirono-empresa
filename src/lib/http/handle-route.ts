import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/observability/logger";

type RouteHandlerResult = unknown | Promise<unknown>;

type ErrorResponseBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type SuccessResponseBody = {
  success: true;
  data: unknown;
};

function normalizeZodError(error: ZodError) {
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

function toErrorResponse(error: unknown): {
  body: ErrorResponseBody;
  status: number;
} {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      body: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "La solicitud no es válida.",
          details: normalizeZodError(error),
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error interno.",
      },
    },
  };
}

export async function handleRoute(
  handler: () => RouteHandlerResult
): Promise<NextResponse<SuccessResponseBody | ErrorResponseBody>> {
  try {
    const data = await handler();

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    const response = toErrorResponse(error);

    logger.error("route_handler_failed", error, {
      status: response.status,
      code:
        response.body.success === false ? response.body.error.code : undefined,
    });

    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}