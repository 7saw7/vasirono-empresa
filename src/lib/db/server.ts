type QueryParams = Array<string | number | boolean | null | undefined>;

export type DbClient = {
  query<T = unknown>(sql: string, params?: QueryParams): Promise<T[]>;
};

class MockDbClient implements DbClient {
  async query<T = unknown>(_sql: string, _params: QueryParams = []): Promise<T[]> {
    /**
     * Placeholder temporal:
     * luego reemplazamos por Supabase/Postgres real.
     */
    return [] as T[];
  }
}

let dbInstance: DbClient | null = null;

export function getDb(): DbClient {
  if (!dbInstance) {
    dbInstance = new MockDbClient();
  }

  return dbInstance;
}