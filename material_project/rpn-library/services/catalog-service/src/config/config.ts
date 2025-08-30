// src/config/config.ts
export const dbConfig = {
  url: process.env.DATABASE_URL || 'postgres://[your-neon-connection-string]',
  schema: 'catalog_service'
}