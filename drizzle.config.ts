import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

export default defineConfig({
  schema: './server/schema.ts',
  out: './server/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_CpkhJdHB42DN@ep-square-math-a97w7u5l-pooler.gwc.azure.neon.tech/lernkarte-ai-database?sslmode=require&channel_binding=require',
  },
})
