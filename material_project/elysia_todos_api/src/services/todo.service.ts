// src/services/todo.service.ts
import { Database } from 'bun:sqlite';
import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/todo.model';
import { TodoDB } from '../plugins/db.plugin';

export class TodoService {
    private db: Database;

    constructor() {
        this.db = TodoDB.getInstance().getDB();
    }

    async getAllTodos(): Promise<Todo[]> {
        return this.db.query('SELECT * FROM todos ORDER BY created_at DESC').all() as Todo[];
    }

    async getTodoById(id: number): Promise<Todo | null> {
        return this.db.query('SELECT * FROM todos WHERE id = ?').get(id) as Todo | null;
    }

    async createTodo(todo: CreateTodoDTO): Promise<Todo> {
        const query = this.db.query(`
            INSERT INTO todos (title, description)
            VALUES ($title, $description)
            RETURNING *
        `);

        return query.get({
            $title: todo.title,
            $description: todo.description
        }) as Todo;
    }

    async updateTodo(id: number, todo: UpdateTodoDTO): Promise<Todo | null> {
        const currentTodo = await this.getTodoById(id);
        if (!currentTodo) return null;

        const updates = [];
        const params: any = { $id: id };

        if (todo.title !== undefined) {
            updates.push('title = $title');
            params.$title = todo.title;
        }
        if (todo.description !== undefined) {
            updates.push('description = $description');
            params.$description = todo.description;
        }
        if (todo.completed !== undefined) {
            updates.push('completed = $completed');
            params.$completed = todo.completed;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const query = this.db.query(`
            UPDATE todos
            SET ${updates.join(', ')}
            WHERE id = $id
            RETURNING *
        `);

        return query.get(params) as Todo;
    }

    async deleteTodo(id: number): Promise<boolean> {
        const result = this.db.run('DELETE FROM todos WHERE id = ?', [id]);
        return result.changes > 0;
    }
}