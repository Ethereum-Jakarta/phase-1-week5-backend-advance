// services/order-service/src/controllers/order.controller.ts
import { db } from '../../../../shared/db';
import type { Order } from '../../../../shared/db/types';

export class OrderController {
    private PRODUCT_SERVICE = 'http://localhost:3001';
    private USER_SERVICE = 'http://localhost:3000';

    async createOrder(data: { userId: string; items: Array<{ productId: string; quantity: number }> }) {
        try {
            // Verify user exists
            const userResponse = await fetch(`${this.USER_SERVICE}/users/${data.userId}`);
            if (!userResponse.ok) {
                throw new Error('User not found');
            }

            let totalAmount = 0;

            // Verify products and calculate total
            for (const item of data.items) {
                // Get product details
                const productResponse = await fetch(`${this.PRODUCT_SERVICE}/products/${item.productId}`);
                if (!productResponse.ok) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                const product = await productResponse.json();

                // Check stock
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.productId}`);
                }

                totalAmount += product.price * item.quantity;
            }

            // Start transaction
            db.exec('BEGIN TRANSACTION');

            try {
                // Create order
                const orderStmt = db.prepare(`
                    INSERT INTO orders (user_id, status, total_amount)
                    VALUES ($userId, 'pending', $totalAmount)
                    RETURNING *
                `);

                const order = orderStmt.get({
                    $userId: data.userId,
                    $totalAmount: totalAmount
                }) as Order;

                // Create order items and update product stock
                for (const item of data.items) {
                    // Get latest product data
                    const productResponse = await fetch(`${this.PRODUCT_SERVICE}/products/${item.productId}`);
                    const product = await productResponse.json();

                    // Insert order item
                    const itemStmt = db.prepare(`
                        INSERT INTO order_items (order_id, product_id, quantity, price)
                        VALUES ($orderId, $productId, $quantity, $price)
                    `);

                    itemStmt.run({
                        $orderId: order.id,
                        $productId: item.productId,
                        $quantity: item.quantity,
                        $price: product.price
                    });

                    // Update product stock through API
                    const updateStockResponse = await fetch(`${this.PRODUCT_SERVICE}/products/${item.productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            stock: product.stock - item.quantity
                        })
                    });

                    if (!updateStockResponse.ok) {
                        throw new Error(`Failed to update stock for product ${item.productId}`);
                    }
                }

                db.exec('COMMIT');

                // Return order with details
                return this.getOrderById(order.id);

            } catch (error: any) {
                db.exec('ROLLBACK');
                throw error;
            }
        } catch (error: any) {
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    async getOrderById(id: string) {
        try {
            const order = db.query(`
                SELECT o.*, u.name as user_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            `).get(id);

            if (!order) return null;

            const items = db.query(`
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `).all(id);

            return { ...order, items };
        } catch (error: any) {
            throw new Error(`Failed to get order: ${error.message}`);
        }
    }

    async getAllOrders() {
        try {
            const orders = db.query(`
                SELECT o.*, u.name as user_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC
            `).all();

            for (const order of orders) {
                order.items = db.query(`
                    SELECT oi.*, p.name as product_name
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                `).all(order.id);
            }

            return orders;
        } catch (error: any) {
            throw new Error(`Failed to get orders: ${error.message}`);
        }
    }

    async updateOrderStatus(id: string, status: Order['status']) {
        try {
            const stmt = db.prepare(`
                UPDATE orders
                SET 
                    status = $status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $id
                RETURNING *
            `);

            const order = stmt.get({
                $id: id,
                $status: status
            });

            if (!order) {
                throw new Error('Order not found');
            }

            return this.getOrderById(id);
        } catch (error: any) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    }

    async getUserOrders(userId: string) {
        try {
            const orders = db.query(`
                SELECT o.*, u.name as user_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            `).all(userId);

            for (const order of orders) {
                order.items = db.query(`
                    SELECT oi.*, p.name as product_name
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                `).all(order.id);
            }

            return orders;
        } catch (error: any) {
            throw new Error(`Failed to get user orders: ${error.message}`);
        }
    }
}