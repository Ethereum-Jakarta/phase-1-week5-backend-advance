// services/product-service/src/index.ts
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { ProductController } from './controllers/product.controller';

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'Product Service API',
                version: '1.0.0',
                description: 'API for managing products'
            },
            tags: [
                { name: 'Products', description: 'Product operations' }
            ]
        }
    }))
    .use(cors())
    .decorate('productController', new ProductController())
    // Get all products
    .get('/products', 
        async ({ productController }) => {
            return await productController.getAll();
        }, {
            detail: {
                tags: ['Products'],
                summary: 'Get all products'
            }
        }
    )
    // Get product by ID
    .get('/products/:id', 
        async ({ params: { id }, productController }) => {
            return await productController.getOne(id);
        }, {
            detail: {
                tags: ['Products'],
                summary: 'Get product by ID'
            }
        }
    )
    // Create product
    .post('/products', 
        async ({ body, productController }) => {
            return await productController.create(body);
        }, {
            body: t.Object({
                name: t.String({
                    minLength: 1,
                    description: 'Product name'
                }),
                price: t.Number({
                    minimum: 0,
                    description: 'Product price'
                }),
                stock: t.Number({
                    minimum: 0,
                    description: 'Product stock quantity'
                })
            }),
            detail: {
                tags: ['Products'],
                summary: 'Create new product'
            }
        }
    )
    // Update product
    .put('/products/:id', 
        async ({ params: { id }, body, productController }) => {
            return await productController.update(id, body);
        }, {
            body: t.Object({
                name: t.Optional(t.String({ minLength: 1 })),
                price: t.Optional(t.Number({ minimum: 0 })),
                stock: t.Optional(t.Number({ minimum: 0 }))
            }),
            detail: {
                tags: ['Products'],
                summary: 'Update product'
            }
        }
    )
    // Delete product
    .delete('/products/:id', 
        async ({ params: { id }, productController }) => {
            return await productController.delete(id);
        }, {
            detail: {
                tags: ['Products'],
                summary: 'Delete product'
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
    .listen(3001);

console.log(`🚀 Product service running at http://localhost:3001`);
console.log(`📚 Swagger documentation available at http://localhost:3001/swagger`);