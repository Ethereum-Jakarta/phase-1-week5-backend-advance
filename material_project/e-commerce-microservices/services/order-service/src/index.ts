// services/order-service/src/index.ts
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { OrderController } from './controllers/order.controller';

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'Order Service API',
                version: '1.0.0',
                description: 'API for managing orders'
            },
            tags: [
                { name: 'Orders', description: 'Order operations' }
            ]
        }
    }))
    .use(cors())
    .decorate('orderController', new OrderController())
    // Get all orders
    .get('/orders', 
        async ({ orderController }) => {
            return await orderController.getAllOrders();
        }, {
            detail: {
                tags: ['Orders'],
                summary: 'Get all orders'
            }
        }
    )
    // Get order by ID
    .get('/orders/:id', 
        async ({ params: { id }, orderController }) => {
            const order = await orderController.getOrderById(id);
            if (!order) {
                throw new Error('Order not found');
            }
            return order;
        }, {
            detail: {
                tags: ['Orders'],
                summary: 'Get order by ID'
            }
        }
    )
    // Create order
    .post('/orders', 
        async ({ body, orderController }) => {
            return await orderController.createOrder(body);
        }, {
            body: t.Object({
                userId: t.String({
                    description: 'ID of the user placing the order'
                }),
                items: t.Array(
                    t.Object({
                        productId: t.String({
                            description: 'ID of the product'
                        }),
                        quantity: t.Number({
                            minimum: 1,
                            description: 'Quantity of the product'
                        })
                    }),
                    { description: 'Order items' }
                )
            }),
            detail: {
                tags: ['Orders'],
                summary: 'Create new order'
            }
        }
    )
    // Update order status
    .patch('/orders/:id/status', 
        async ({ params: { id }, body, orderController }) => {
            return await orderController.updateOrderStatus(id, body.status);
        }, {
            body: t.Object({
                status: t.Union([
                    t.Literal('pending'),
                    t.Literal('processing'),
                    t.Literal('completed'),
                    t.Literal('cancelled')
                ], { description: 'New order status' })
            }),
            detail: {
                tags: ['Orders'],
                summary: 'Update order status'
            }
        }
    )
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
    .listen(3002);

console.log(`🚀 Order service running at http://localhost:3002`);
console.log(`📚 Swagger documentation available at http://localhost:3002/swagger`);