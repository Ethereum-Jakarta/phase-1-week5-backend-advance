// services/product-service/src/controllers/product.controller.ts
import { db } from '../../../../shared/db';
import type { Product } from '../../../../shared/db/types';

export class ProductController {
    async getAll() {
        try {
            return db.query(`
                SELECT p.*, c.name as category_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ORDER BY p.created_at DESC
            `).all();
        } catch (error) {
            throw new Error(`Failed to get products: ${error.message}`);
        }
    }

    async getOne(id: string) {
        try {
            const product = db.query(`
                SELECT p.*, c.name as category_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?
            `).get(id);

            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            throw new Error(`Failed to get product: ${error.message}`);
        }
    }

    async create(productData: {
        name: string;
        description?: string;
        price: number;
        stock: number;
        category_id?: number;
    }) {
        try {
            // Validate category if provided
            if (productData.category_id) {
                const category = db.query('SELECT id FROM categories WHERE id = ?')
                    .get(productData.category_id);
                if (!category) {
                    throw new Error('Category not found');
                }
            }

            const stmt = db.prepare(`
                INSERT INTO products (
                    name, description, price, stock, category_id
                )
                VALUES (
                    $name, $description, $price, $stock, $category_id
                )
                RETURNING *
            `);

            return stmt.get({
                $name: productData.name,
                $description: productData.description,
                $price: productData.price,
                $stock: productData.stock,
                $category_id: productData.category_id
            }) as Product;
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    async update(id: string, productData: Partial<{
        name: string;
        description: string;
        price: number;
        stock: number;
        category_id: number;
    }>) {
        try {
            // Validate category if provided
            if (productData.category_id) {
                const category = db.query('SELECT id FROM categories WHERE id = ?')
                    .get(productData.category_id);
                if (!category) {
                    throw new Error('Category not found');
                }
            }

            const updates: string[] = [];
            const params: any = { $id: id };

            if (productData.name) {
                updates.push('name = $name');
                params.$name = productData.name;
            }
            if (productData.description !== undefined) {
                updates.push('description = $description');
                params.$description = productData.description;
            }
            if (productData.price !== undefined) {
                updates.push('price = $price');
                params.$price = productData.price;
            }
            if (productData.stock !== undefined) {
                updates.push('stock = $stock');
                params.$stock = productData.stock;
            }
            if (productData.category_id !== undefined) {
                updates.push('category_id = $category_id');
                params.$category_id = productData.category_id;
            }

            if (updates.length === 0) return null;

            updates.push('updated_at = CURRENT_TIMESTAMP');

            const stmt = db.prepare(`
                UPDATE products
                SET ${updates.join(', ')}
                WHERE id = $id
                RETURNING *
            `);

            const product = stmt.get(params);
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    async delete(id: string) {
        try {
            // Check if product is used in any orders
            const orderItem = db.query(`
                SELECT 1 FROM order_items WHERE product_id = ?
            `).get(id);

            if (orderItem) {
                throw new Error('Cannot delete product with existing orders');
            }

            const result = db.run('DELETE FROM products WHERE id = ?', [id]);
            if (result.changes === 0) {
                throw new Error('Product not found');
            }
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    // Category methods
    async createCategory(data: { name: string; description?: string }) {
        try {
            const stmt = db.prepare(`
                INSERT INTO categories (name, description)
                VALUES ($name, $description)
                RETURNING *
            `);

            return stmt.get({
                $name: data.name,
                $description: data.description
            });
        } catch (error) {
            throw new Error(`Failed to create category: ${error.message}`);
        }
    }

    async getCategories() {
        try {
            return db.query(`
                SELECT c.*, 
                    COUNT(p.id) as product_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                GROUP BY c.id
                ORDER BY c.name
            `).all();
        } catch (error) {
            throw new Error(`Failed to get categories: ${error.message}`);
        }
    }

    async updateStock(id: string, quantity: number) {
        try {
            const stmt = db.prepare(`
                UPDATE products
                SET 
                    stock = stock - $quantity,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $id AND stock >= $quantity
                RETURNING *
            `);

            const product = stmt.get({
                $id: id,
                $quantity: quantity
            });

            if (!product) {
                throw new Error('Insufficient stock or product not found');
            }

            return product;
        } catch (error) {
            throw new Error(`Failed to update stock: ${error.message}`);
        }
    }
}