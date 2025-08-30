// src/utils/database.ts
// Database utility using Bun's built-in SQLite support
import { Database } from 'bun:sqlite';

export class TodoDB {
    private static instance: TodoDB;
    private db: Database;

    private constructor() {
        this.db = new Database('todos.db');
        this.initializeDatabase();
    }

    public static getInstance(): TodoDB {
        if (!TodoDB.instance) {
            TodoDB.instance = new TodoDB();
        }
        return TodoDB.instance;
    }

    private initializeDatabase() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public getDB(): Database {
        return this.db;
    }
}