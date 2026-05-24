import { env } from "./env"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "../db/schema"

const pool = new Pool({
  connectionString: env.PG_URL,
})

export const db = drizzle(pool, { schema })

export { pool }

export default db
