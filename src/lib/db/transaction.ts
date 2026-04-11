import { getDb, type DbTransactionClient } from "@/lib/db/server";

export async function withTransaction<T>(
  callback: (tx: DbTransactionClient) => Promise<T>
): Promise<T> {
  const db = getDb();
  return db.transaction(callback);
}