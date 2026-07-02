import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { types } from "pg"
import * as schema from "@/db/schema"

types.setTypeParser(1700, (val: string) => parseFloat(val))

function createConnectionString() {
  return process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || ""
}

let _db: ReturnType<typeof drizzle> | null = null
let _pool: Pool | null = null

function getOrCreateDb() {
  if (!_db) {
    const connectionString = createConnectionString()
    if (!connectionString) {
      throw new Error("SUPABASE_DB_URL or DATABASE_URL is required for Drizzle")
    }
    _pool = new Pool({ connectionString })
    _db = drizzle(_pool, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (getOrCreateDb() as any)[prop]
  },
})

export async function closeDb() {
  if (_pool) {
    await _pool.end()
    _pool = null
    _db = null
  }
}
