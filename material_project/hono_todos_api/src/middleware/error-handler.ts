// src/middleware/error-handler.ts
// Global error handling middleware
import { Context, Next } from 'hono';

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        console.error('Error:', error);
        return c.json(
            { message: 'Internal Server Error' },
            500
        );
    }
}