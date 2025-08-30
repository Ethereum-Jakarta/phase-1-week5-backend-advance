// src/plugins/validation.ts
import { Elysia } from 'elysia';

export const validation = new Elysia()
  .onError(({ code, error, set }: any) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          error: 'Validation Error',
          details: error.message
        };
      default:
        set.status = 500;
        return {
          error: 'Internal Server Error',
          message: error.message
        };
    }
  });