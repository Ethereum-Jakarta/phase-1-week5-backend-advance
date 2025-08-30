// services/product-service/src/db/index.ts
import { Database } from 'bun:sqlite';
import { Product } from '../type';

export class ProductDB {
    private db: Database;
    private static instance: ProductDB;

    private constructor() {
        this.db = new Database('products.sqlite');
        this.initializeDatabase();
    }

    static getInstance(): ProductDB {
        if (!ProductDB.instance) {
            ProductDB.instance = new ProductDB();
        }
        return ProductDB.instance;
    }

    private initializeDatabase() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async getAllProducts(): Promise<Product[]> {
        return this.db.query('SELECT * FROM products').all() as Product[];
    }

    async getProductById(id: string): Promise<Product | null> {
        return this.db.query('SELECT * FROM products WHERE id = ?').get(id) as Product | null;
    }

    async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const id = crypto.randomUUID();
        const query = this.db.query(`
            INSERT INTO products (id, name, price, stock)
            VALUES ($id, $name, $price, $stock)
            RETURNING *
        `);

        return query.get({
            $id: id,
            $name: product.name,
            $price: product.price,
            $stock: product.stock
        }) as Product;
    }

    async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
        const sets: string[] = [];
        const params: any = { $id: id };

        if (productData.name) {
            sets.push('name = $name');
            params.$name = productData.name;
        }
        if (productData.price !== undefined) {
            sets.push('price = $price');
            params.$price = productData.price;
        }
        if (productData.stock !== undefined) {
            sets.push('stock = $stock');
            params.$stock = productData.stock;
        }

        if (sets.length === 0) return null;

        const query = this.db.query(`
            UPDATE products
            SET ${sets.join(', ')}
            WHERE id = $id
            RETURNING *
        `);

        return query.get(params) as Product | null;
    }

    async deleteProduct(id: string): Promise<boolean> {
        const result = this.db.run('DELETE FROM products WHERE id = ?', [id]);
        return result.changes > 0;
    }
}