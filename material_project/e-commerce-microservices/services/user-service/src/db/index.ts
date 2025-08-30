// services/user-service/src/db/index.ts
import { Database } from 'bun:sqlite';
import type { User } from '../type';

export class UserDB {
    private db: Database;
    private static instance: UserDB;

    private constructor() {
        this.db = new Database('users.sqlite');
        this.initializeDatabase();
    }

    static getInstance(): UserDB {
        if (!UserDB.instance) {
            UserDB.instance = new UserDB();
        }
        return UserDB.instance;
    }

    private initializeDatabase() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async getAllUsers(): Promise<User[]> {
        return this.db.query('SELECT * FROM users').all() as User[];
    }

    async getUserById(id: string): Promise<User | null> {
        return this.db.query('SELECT * FROM users WHERE id = ?').get(id) as User | null;
    }

    async createUser(user: Omit<User, 'id'>): Promise<User> {
        const id = crypto.randomUUID();
        const query = this.db.query(`
            INSERT INTO users (id, name, email)
            VALUES ($id, $name, $email)
            RETURNING *
        `);

        return query.get({
            $id: id,
            $name: user.name,
            $email: user.email
        }) as User;
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        const sets: string[] = [];
        const params: any = { $id: id };

        if (userData.name) {
            sets.push('name = $name');
            params.$name = userData.name;
        }
        if (userData.email) {
            sets.push('email = $email');
            params.$email = userData.email;
        }

        if (sets.length === 0) return null;

        const query = this.db.query(`
            UPDATE users
            SET ${sets.join(', ')}
            WHERE id = $id
            RETURNING *
        `);

        return query.get(params) as User | null;
    }

    async deleteUser(id: string) {
        const result = this.db.run('DELETE FROM users WHERE id = ?', [id]);
        return {res : result.changes > 0,
            message: 'Success Delete User'
        };
    }
}