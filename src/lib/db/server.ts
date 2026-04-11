import "server-only";
import { AppError } from "@/lib/errors/app-error";
import { mapDatabaseError } from "@/lib/db/errors";
import { logger } from "@/lib/observability/logger";

type QueryPrimitive = string | number | boolean | null | undefined | Date;
type QueryParams = QueryPrimitive[];

type PgQueryResult<T> = {
  rows: T[];
};

type PgPoolClient = {
  query: <T = unknown>(
    sql: string,
    params?: QueryParams
  ) => Promise<PgQueryResult<T>>;
  release: () => void;
};

type PgPoolInstance = {
  query: <T = unknown>(
    sql: string,
    params?: QueryParams
  ) => Promise<PgQueryResult<T>>;
  connect: () => Promise<PgPoolClient>;
  end?: () => Promise<void>;
};

type PgModule = {
  Pool: new (config: {
    connectionString: string;
    ssl?: { rejectUnauthorized: boolean };
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }) => PgPoolInstance;
};

export type DbTransactionClient = {
  query<T = unknown>(sql: string, params?: QueryParams): Promise<T[]>;
};

export type DbClient = {
  query<T = unknown>(sql: string, params?: QueryParams): Promise<T[]>;
  transaction<T>(callback: (tx: DbTransactionClient) => Promise<T>): Promise<T>;
};

const DEFAULT_STATEMENT_TIMEOUT_MS = parseInt(
  process.env.DB_STATEMENT_TIMEOUT_MS ?? "10000",
  10
);

const SLOW_QUERY_THRESHOLD_MS = parseInt(
  process.env.DB_SLOW_QUERY_THRESHOLD_MS ?? "400",
  10
);

class PostgresTransactionClient implements DbTransactionClient {
  constructor(private readonly client: PgPoolClient) {}

  async query<T = unknown>(sql: string, params: QueryParams = []): Promise<T[]> {
    return runQueryWithHandling(this.client, sql, params, {
      statementTimeoutMs: DEFAULT_STATEMENT_TIMEOUT_MS,
      source: "transaction",
    });
  }
}

class PostgresDbClient implements DbClient {
  private static poolPromise: Promise<PgPoolInstance> | null = null;

  private async getPool() {
    if (!PostgresDbClient.poolPromise) {
      PostgresDbClient.poolPromise = (async () => {
        const connectionString = process.env.DATABASE_URL?.trim();

        if (!connectionString) {
          throw new AppError(
            "SERVER_CONFIG_ERROR",
            "DATABASE_URL no está definido.",
            500
          );
        }

        const { Pool } = (await import("pg")) as PgModule;

        return new Pool({
          connectionString,
          ssl: shouldUseSsl(connectionString)
            ? { rejectUnauthorized: false }
            : undefined,
          max: parseIntegerEnv("DB_POOL_MAX", 10),
          idleTimeoutMillis: parseIntegerEnv("DB_IDLE_TIMEOUT_MS", 30000),
          connectionTimeoutMillis: parseIntegerEnv(
            "DB_CONNECTION_TIMEOUT_MS",
            10000
          ),
        });
      })();
    }

    return PostgresDbClient.poolPromise;
  }

  async query<T = unknown>(sql: string, params: QueryParams = []): Promise<T[]> {
    const pool = await this.getPool();

    return runQueryWithHandling(pool, sql, params, {
      statementTimeoutMs: DEFAULT_STATEMENT_TIMEOUT_MS,
      source: "pool",
    });
  }

  async transaction<T>(
    callback: (tx: DbTransactionClient) => Promise<T>
  ): Promise<T> {
    const pool = await this.getPool();
    const client = await pool.connect();
    const tx = new PostgresTransactionClient(client);

    try {
      await client.query("BEGIN");
      await client.query(
        `SET LOCAL statement_timeout = ${DEFAULT_STATEMENT_TIMEOUT_MS}`
      );

      const result = await callback(tx);

      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        logger.error("db_transaction_rollback_failed", rollbackError);
      }

      throw normalizeDbError(error);
    } finally {
      client.release();
    }
  }
}

let dbInstance: DbClient | null = null;

export function getDb(): DbClient {
  if (!dbInstance) {
    dbInstance = new PostgresDbClient();
  }

  return dbInstance;
}

async function runQueryWithHandling<T>(
  executor: {
    query: <R = unknown>(
      sql: string,
      params?: QueryParams
    ) => Promise<PgQueryResult<R>>;
  },
  sql: string,
  params: QueryParams,
  options: {
    statementTimeoutMs: number;
    source: "pool" | "transaction";
  }
): Promise<T[]> {
  const startedAt = Date.now();

  try {
    if (options.source === "pool") {
      await executor.query(`SET statement_timeout = ${options.statementTimeoutMs}`);
    }

    const result = await executor.query<T>(sql, params);
    const durationMs = Date.now() - startedAt;

    if (durationMs >= SLOW_QUERY_THRESHOLD_MS) {
      logger.warn("db_slow_query", {
        durationMs,
        source: options.source,
        sql: sanitizeSql(sql),
        paramsCount: params.length,
      });
    }

    return result.rows;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    logger.error("db_query_failed", error, {
      durationMs,
      source: options.source,
      sql: sanitizeSql(sql),
      paramsCount: params.length,
    });

    throw normalizeDbError(error);
  }
}

function normalizeDbError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  return mapDatabaseError(error);
}

function parseIntegerEnv(key: string, fallback: number): number {
  const raw = process.env[key];

  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim().slice(0, 500);
}

function shouldUseSsl(connectionString: string): boolean {
  if (process.env.DB_SSL === "true") return true;
  if (process.env.DB_SSL === "false") return false;

  return !/localhost|127\.0\.0\.1/i.test(connectionString);
}