type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function write(level: LogLevel, message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    write("info", message, meta);
  },

  warn(message: string, meta?: LogMeta) {
    write("warn", message, meta);
  },

  error(message: string, error?: unknown, meta?: LogMeta) {
    write("error", message, {
      ...(meta ?? {}),
      ...(error !== undefined ? { error: serializeError(error) } : {}),
    });
  },
};