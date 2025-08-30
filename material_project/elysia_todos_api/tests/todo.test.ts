// tests/todo.test.ts
import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { todoController } from '../src/controllers/todo.controller';

describe('Todo API', () => {
    let app: Elysia;

    beforeAll(() => {
        app = new Elysia().use(todoController);
    });

    it('should create a new todo', async () => {
        const response = await app.handle(
            new Request('http://localhost/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Todo',
                    description: 'Test Description'
                })
            })
        );

        const todo = await response.json();
        expect(response.status).toBe(201);
        expect(todo.title).toBe('Test Todo');
    });
});