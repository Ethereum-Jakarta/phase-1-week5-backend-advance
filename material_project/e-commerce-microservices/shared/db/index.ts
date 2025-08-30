// shared/db/index.ts
import { Database } from 'bun:sqlite';

export class DB {
    private static instance: Database;

    private constructor() { }

    public static getInstance(): Database {
        if (!DB.instance) {
            try {
                DB.instance = new Database('ecommerce.db');
                DB.initializeTables();
            } catch (error) {
                console.error("Database initialization error:", error);
                throw error;
            }
        }
        return DB.instance;
    }

    private static initializeTables() {
        const db = DB.instance;

        try {
            db.exec(`
                -- Users table
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                -- Products table
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL,
                    stock INTEGER NOT NULL,
                    category_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                );

                -- Orders table
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')),
                    total_amount DECIMAL(10,2) NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );
            `);
        } catch (error) {
            console.error("Error creating tables:", error);
            throw error;
        }
    }
}

// Export the database instance
export const db = DB.getInstance();

// Database helper functions
export const dbHelpers = {
    async transaction<T>(callback: () => Promise<T>): Promise<T> {
        try {
            db.exec('BEGIN TRANSACTION');
            const result = await callback();
            db.exec('COMMIT');
            return result;
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
};