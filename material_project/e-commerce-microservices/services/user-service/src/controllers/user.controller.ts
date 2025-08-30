// services/user-service/src/controllers/user.controller.ts
import { db } from '../../../../shared/db';
import type { User } from '../../../../shared/db/types';

export class UserController {
    async getAll() {
        try {
            return db.query('SELECT * FROM users ORDER BY created_at DESC').all();
        } catch (error: any) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }

    async getOne(id: string) {
        try {
            const user = db.query('SELECT * FROM users WHERE id = ?').get(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: any) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    async create(userData: { name: string; email: string }) {
        try {
            const stmt = db.prepare(`
                INSERT INTO users (name, email)
                VALUES ($name, $email)
                RETURNING *
            `);

            return stmt.get({
                $name: userData.name,
                $email: userData.email
            }) as User;
        } catch (error: any) {
            if (error.message.includes('UNIQUE')) {
                throw new Error('Email already exists');
            }
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    async update(id: string, userData: Partial<{ name: string; email: string }>) {
        try {
            const updates: string[] = [];
            const params: any = { $id: id };

            if (userData.name) {
                updates.push('name = $name');
                params.$name = userData.name;
            }
            if (userData.email) {
                updates.push('email = $email');
                params.$email = userData.email;
            }

            if (updates.length === 0) return null;

            updates.push('updated_at = CURRENT_TIMESTAMP');

            const stmt = db.prepare(`
                UPDATE users
                SET ${updates.join(', ')}
                WHERE id = $id
                RETURNING *
            `);

            const user = stmt.get(params);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: any) {
            if (error.message.includes('UNIQUE')) {
                throw new Error('Email already exists');
            }
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async delete(id: string) {
        try {
            // Check if user has orders
            const hasOrders = db.query('SELECT 1 FROM orders WHERE user_id = ?').get(id);
            if (hasOrders) {
                throw new Error('Cannot delete user with existing orders');
            }

            const result = db.run('DELETE FROM users WHERE id = ?', [id]);
            if (result.changes === 0) {
                throw new Error('User not found');
            }
            return { success: true };
        } catch (error: any) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    async getUserWithOrders(id: string) {
        try {
            const user = await this.getOne(id);
            const orders = db.query(`
                SELECT o.*, 
                    json_group_array(
                        json_object(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'product_name', p.name
                        )
                    ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE o.user_id = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `).all(id);

            return { ...user, orders };
        } catch (error: any) {
            throw new Error(`Failed to get user with orders: ${error.message}`);
        }
    }
}