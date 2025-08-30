// src/plugins/db.plugin.ts
import { Database } from 'bun:sqlite';

export class TodoDB {
    private db: Database;
    private static instance: TodoDB;

    private constructor() {
        this.db = new Database('todos.db');
        this.initializeDatabase();
    }

    static getInstance(): TodoDB {
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

    getDB(): Database {
        return this.db;
    }
}