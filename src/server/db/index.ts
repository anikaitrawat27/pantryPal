import "server-only";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import path from "node:path";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

let dbPromise: Promise<Db> | null = null;

/**
 * The database for this process.
 *
 * - `DATABASE_URL` set (production, or local against Neon): Neon over WebSockets.
 *   Migrations are applied by `npm run db:migrate`, which runs before every build.
 * - Otherwise: PGlite, an in-process Postgres, migrated on first use. Data lives in
 *   `PGLITE_DIR` (default `.data/pglite`), or in memory when that is `memory://`.
 *   Production refuses this fallback unless `PGLITE_DIR` is set explicitly (the E2E server does).
 */
export function getDb(): Promise<Db> {
  dbPromise ??= connect().catch((err) => {
    dbPromise = null;
    throw err;
  });
  return dbPromise;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-serverless");
    return drizzle({ client: new Pool({ connectionString: url }), schema }) as unknown as Db;
  }
  const dir = process.env.PGLITE_DIR;
  if (process.env.NODE_ENV === "production" && !dir) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres database in Vercel (Storage, then Neon) to enable accounts.",
    );
  }
  return openPglite(dir ?? path.join(process.cwd(), ".data/pglite"));
}

/** Opens and migrates a PGlite database. Exported for tests, which use `memory://`. */
export async function openPglite(dataDir: string): Promise<Db> {
  if (!dataDir.includes("://")) (await import("node:fs")).mkdirSync(dataDir, { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const db = drizzle({ client: new PGlite(dataDir), schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db as unknown as Db;
}

/** Points getDb() at a specific database. Tests only. */
export function setDbForTests(db: Db) {
  dbPromise = Promise.resolve(db);
}
