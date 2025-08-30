// gateway/src/index.ts
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

// Define service URLs
const SERVICES = {
    users: 'http://localhost:3000',
    products: 'http://localhost:3001',
    orders: 'http://localhost:3002'
} as const;

const app = new Elysia()
    .use(cors())
    .use(swagger({
        documentation: {
            info: {
                title: 'E-Commerce API Gateway',
                version: '1.0.0',
                description: 'Gateway for e-commerce microservices'
            },
            tags: [
                { name: 'Users', description: 'User management operations' },
                { name: 'Products', description: 'Product management operations' },
                { name: 'Orders', description: 'Order management operations' },
                { name: 'System', description: 'System operations' }
            ]
        }
    }))

    // Users API
    .group('/api/users', app => app
        // Get all users
        .get('/', async () => {
            const response = await fetch(`${SERVICES.users}/users`);
            if (!response.ok) throw new Error('Users service error');
            return response.json();
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Get all users'
            }
        })
        // Get user by ID
        .get('/:id', async ({ params: { id } }) => {
            const response = await fetch(`${SERVICES.users}/users/${id}`);
            if (!response.ok) throw new Error('User not found');
            return response.json();
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Get user by ID'
            }
        })
        // Create user
        .post('/', async ({ body }) => {
            const response = await fetch(`${SERVICES.users}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to create user');
            return response.json();
        }, {
            body: t.Object({
                name: t.String(),
                email: t.String()
            }),
            detail: {
                tags: ['Users'],
                summary: 'Create a new user'
            }
        })
        // Update user
        .put('/:id', async ({ params: { id }, body }) => {
            const response = await fetch(`${SERVICES.users}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to update user');
            return response.json();
        }, {
            body: t.Object({
                name: t.Optional(t.String()),
                email: t.Optional(t.String())
            }),
            detail: {
                tags: ['Users'],
                summary: 'Update user'
            }
        })
        // Delete user
        .delete('/:id', async ({ params: { id } }) => {
            const response = await fetch(`${SERVICES.users}/users/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete user');
            return response.json();
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Delete user'
            }
        })
        // Get user orders
        .get('/:id/orders', async ({ params: { id } }) => {
            const response = await fetch(`${SERVICES.users}/users/${id}/orders`);
            if (!response.ok) throw new Error('Failed to get user orders');
            return response.json();
        }, {
            detail: {
                tags: ['Users'],
                summary: 'Get user orders'
            }
        })
    )

    // Products API
    .group('/api/products', app => app
        // Get all products
        .get('/', async () => {
            const response = await fetch(`${SERVICES.products}/products`);
            if (!response.ok) throw new Error('Products service error');
            return response.json();
        }, {
            detail: {
                tags: ['Products'],
                summary: 'Get all products'
            }
        })
        // Get product by ID
        .get('/:id', async ({ params: { id } }) => {
            const response = await fetch(`${SERVICES.products}/products/${id}`);
            if (!response.ok) throw new Error('Product not found');
            return response.json();
        }, {
            detail: {
                tags: ['Products'],
                summary: 'Get product by ID'
            }
        })
        // Create product
        .post('/', async ({ body }) => {
            const response = await fetch(`${SERVICES.products}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to create product');
            return response.json();
        }, {
            body: t.Object({
                name: t.String(),
                description: t.String(),
                price: t.Number(),
                stock: t.Number(),
                category_id: t.Optional(t.Number())
            }),
            detail: {
                tags: ['Products'],
                summary: 'Create a new product'
            }
        })
        // Update product
        .put('/:id', async ({ params: { id }, body }) => {
            const response = await fetch(`${SERVICES.products}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to update product');
            return response.json();
        }, {
            body: t.Object({
                name: t.Optional(t.String()),
                description: t.Optional(t.String()),
                price: t.Optional(t.Number()),
                stock: t.Optional(t.Number()),
                category_id: t.Optional(t.Number())
            }),
            detail: {
                tags: ['Products'],
                summary: 'Update product'
            }
        })
        // Delete product
        .delete('/:id', async ({ params: { id } }) => {
            const response = await fetch(`${SERVICES.products}/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete product');
            return response.json();
        }, {
            detail: {
                tags: ['Products'],
                summary: 'Delete product'
            }
        })
    )

    // Orders API
    .group('/api/orders', app => app
        // Get all orders
        .get('/', async () => {
            const response = await fetch(`${SERVICES.orders}/orders`);
            if (!response.ok) throw new Error('Orders service error');
            return response.json();
        }, {
            detail: {
                tags: ['Orders'],
                summary: 'Get all orders'
            }
        })
        // Get order by ID
        .get('/:id', async ({ params: { id } }) => {
            const response = await fetch(`${SERVICES.orders}/orders/${id}`);
            if (!response.ok) throw new Error('Order not found');
            return response.json();
        }, {
            detail: {
                tags: ['Orders'],
                summary: 'Get order by ID'
            }
        })
        // Create order
        .post('/', async ({ body }) => {
            const response = await fetch(`${SERVICES.orders}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to create order');
            return response.json();
        }, {
            body: t.Object({
                userId: t.String(),
                items: t.Array(t.Object({
                    productId: t.String(),
                    quantity: t.Number()
                }))
            }),
            detail: {
                tags: ['Orders'],
                summary: 'Create a new order'
            }
        })
        // Update order status
        .patch('/:id/status', async ({ params: { id }, body }) => {
            const response = await fetch(`${SERVICES.orders}/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to update order status');
            return response.json();
        }, {
            body: t.Object({
                status: t.Union([
                    t.Literal('pending'),
                    t.Literal('processing'),
                    t.Literal('completed'),
                    t.Literal('cancelled')
                ])
            }),
            detail: {
                tags: ['Orders'],
                summary: 'Update order status'
            }
        })
    )

    // Health check endpoint
    .get('/health', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            users: `${SERVICES.users} (Users Service)`,
            products: `${SERVICES.products} (Products Service)`,
            orders: `${SERVICES.orders} (Orders Service)`
        }
    }), {
        detail: {
            tags: ['System'],
            summary: 'Check gateway health'
        }
    })

    // Error handler
    .onError(({ code, error }) => {
        console.error(`Gateway Error: ${error.message}`);
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
    .listen(8000);

console.log(`🚀 Gateway running at http://localhost:8000`);
console.log(`📚 Swagger documentation at http://localhost:8000/swagger`);