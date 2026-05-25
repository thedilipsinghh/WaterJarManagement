/// <reference types="node" />
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: (() => {
      if (!process.env.PG_URL) {
        throw new Error("PG_URL is required but not set in environment variables")
      }
      return process.env.PG_URL
    })(),
  },
})
