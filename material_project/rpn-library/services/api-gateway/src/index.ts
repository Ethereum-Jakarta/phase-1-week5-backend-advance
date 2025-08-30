// src/index.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'
import { proxies } from './routes/proxies'
import { logger } from './middleware/logger'
import { swaggerConfig } from './swagger/config'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    // @ts-ignore
    documentation: swaggerConfig
  }))
  .use(cors())
  .use(logger)
  .use(rateLimit)
  .use(errorHandler)
  .use(proxies)
  .listen(3000)

console.log(`🚀 API Gateway running at ${app.server?.hostname}:${app.server?.port}`)