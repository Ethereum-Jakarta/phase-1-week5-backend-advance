// src/middleware/logger.ts
import { Elysia } from 'elysia';

export const logger = new Elysia()
    .onRequest(({ request }) => {
        console.log(`${new Date().toISOString()} [Request] ${request.method} ${request.url}`);
    })
    .on('afterHandle', ({ request, response }) => {
        console.log(
            `${new Date().toISOString()} [Response] ${request.method} ${request.url} - Status: ${response?.status}`
        );
    });
