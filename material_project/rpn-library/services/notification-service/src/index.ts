// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'
import { notificationRoutes } from './routes/norificationRoutes'
import { errorHandler } from './middleware/errorHandler'
import { setupConsumers } from './queue/consumers'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Notification Service API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  }))
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .use(errorHandler)
  .use(notificationRoutes)
  .listen(3005)

// Setup RabbitMQ consumers
setupConsumers()

console.log(`🚀 Notification service is running at ${app.server?.hostname}:${app.server?.port}`)
