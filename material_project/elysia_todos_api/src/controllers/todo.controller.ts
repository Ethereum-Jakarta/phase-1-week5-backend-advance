// src/controllers/todo.controller.ts
import { Elysia } from 'elysia';
import { todoSchema } from '../schemas/todo.schema';
import { TodoService } from '../services/todo.service';

const todoService = new TodoService();

export const todoController = new Elysia({ prefix: '/todos' })
    // Get all todos
    .get('/', async () => {
        return await todoService.getAllTodos();
    })

    // Get todo by id
    .get('/:id', async ({ params: { id }, set }) => {
        const todo = await todoService.getTodoById(Number(id));
        if (!todo) {
            set.status = 404;
            return { message: 'Todo not found' };
        }
        return todo;
    })

    // Create todo
    .post('/', async ({ body, set }) => {
        const todo = await todoService.createTodo(body);
        set.status = 201;
        return todo;
    }, {
        body: todoSchema.createTodo
    })

    // Update todo
    .put('/:id', async ({ params: { id }, body, set }) => {
        const todo = await todoService.updateTodo(Number(id), body);
        if (!todo) {
            set.status = 404;
            return { message: 'Todo not found' };
        }
        return todo;
    }, {
        body: todoSchema.updateTodo
    })

    // Delete todo
    .delete('/:id', async ({ params: { id }, set }) => {
        const deleted = await todoService.deleteTodo(Number(id));
        if (!deleted) {
            set.status = 404;
            return { message: 'Todo not found' };
        }
        set.status = 204;
    });