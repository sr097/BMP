import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let dbAvailable = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    dbAvailable = true;
  } catch (err) {
    console.warn("Database connection failed - using in-memory fallback:", err);
    dbAvailable = false;
  }
} else {
  console.warn("DATABASE_URL not set - database features will be disabled");
}

export { pool, db, dbAvailable };

export * from "./schema";
