// services/user-service/src/index.ts
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { UserController } from './controllers/user.controller';

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'User Service API',
                version: '1.0.0',
                description: 'Service for managing users'
            },
            tags: [
                { name: 'Users', description: 'User operations' }
            ]
        }
    }))
    .use(cors())
    .decorate('userController', new UserController())
    // Get all users
    .get('/users', 
        async ({ userController }) => {
            return await userController.getAll();
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Get all users'
            }
        }
    )
    // Get user by ID
    .get('/users/:id', 
        async ({ params: { id }, userController }) => {
            return await userController.getOne(id);
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Get user by ID'
            }
        }
    )
    // Create user
    .post('/users', 
        async ({ body, userController }) => {
            return await userController.create(body);
        }, {
            body: t.Object({
                name: t.String({
                    minLength: 2,
                    maxLength: 50,
                    description: 'User name'
                }),
                email: t.String({
                    format: 'email',
                    description: 'User email'
                })
            }),
            detail: {
                tags: ['Users'],
                summary: 'Create new user'
            }
        }
    )
    // Update user
    .put('/users/:id', 
        async ({ params: { id }, body, userController }) => {
            return await userController.update(id, body);
        }, {
            body: t.Object({
                name: t.Optional(t.String({
                    minLength: 2,
                    maxLength: 50
                })),
                email: t.Optional(t.String({
                    format: 'email'
                }))
            }),
            detail: {
                tags: ['Users'],
                summary: 'Update user'
            }
        }
    )
    // Delete user
    .delete('/users/:id', 
        async ({ params: { id }, userController }) => {
            return await userController.delete(id);
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Delete user'
            }
        }
    )
    // Get user orders
    .get('/users/:id/orders', 
        async ({ params: { id }, userController }) => {
            return await userController.getUserWithOrders(id);
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Get user orders'
            }
        }
    )
    // Error handler
    .onError(({ code, error }) => {
        return new Response(JSON.stringify({
            error: error.message,
            code
        }), {
            status: code === 'NOT_FOUND' ? 404 : 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    })
    .listen(3000);

console.log(`🚀 User service running at http://localhost:3000`);
console.log(`📚 Swagger documentation available at http://localhost:3000/swagger`);