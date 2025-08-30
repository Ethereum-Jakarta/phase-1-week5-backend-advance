// tests/setup.ts
import { mock } from "bun:test";

// Global mock for database
mock.module('../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: () => []
      })
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => []
        })
      })
    })
  }
}));