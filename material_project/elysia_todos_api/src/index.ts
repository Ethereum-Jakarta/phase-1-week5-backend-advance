// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { todoController } from './controllers/todo.controller'

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'Todo API Documentation',
                version: '1.0.0',
                description: 'A RESTful API for managing todos built with Elysia and Bun',
                contact: {
                    name: 'API Support',
                    email: 'support@example.com'
                }
            },
            tags: [
                {
                    name: 'Todos',
                    description: 'Todo management endpoints'
                }
            ],
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local development server'
                }
            ]
        },
        path: '/docs',  // This will serve the Swagger UI at /docs
        specification: {
            basePath: '/api/v1',
            securityDefinitions: {
                // You can add authentication documentation here
            }
        }
    }))
    .use(cors())
    .use(todoController)
    .listen(3000)

console.log(`🦊 Todo API is running at ${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 Swagger documentation available at http://localhost:3000/docs`)