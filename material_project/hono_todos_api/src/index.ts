// src/index.ts
import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { TodoService } from './services/todo.service';
import { todoSchemas } from './schemas/todo.schema';
import { errorHandler } from './middleware/error-handler';

// Initialize our Todo service
const todoService = new TodoService();

// Create Hono app instance
const app = new Hono();

// Configure middleware
app.use('*', cors());
app.use('*', errorHandler);

// Swagger documentation setup
app.get(
    '/docs',
    swaggerUI({
        url: '/docs/swagger.json',
        title: 'Todo API Documentation'
    })
);

// Swagger JSON specification
app.get('/docs/swagger.json', (c) => {
    return c.json({
        openapi: '3.0.0',
        info: {
            title: 'Todo API',
            version: '1.0.0',
            description: 'A RESTful API for managing todos built with Hono and Bun'
        },
        paths: {
            '/todos': {
                get: {
                    summary: 'Get all todos',
                    tags: ['Todos'],
                    responses: {
                        200: {
                            description: 'List of todos',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Todo' }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: 'Create a new todo',
                    tags: ['Todos'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CreateTodoBody' }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Todo created successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Todo' }
                                }
                            }
                        }
                    }
                }
            },
            '/todos/{id}': {
                get: {
                    summary: 'Get a todo by ID',
                    tags: ['Todos'],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Todo found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Todo' }
                                }
                            }
                        },
                        404: {
                            description: 'Todo not found'
                        }
                    }
                },
                put: {
                    summary: 'Update a todo',
                    tags: ['Todos'],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UpdateTodoBody' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Todo updated successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Todo' }
                                }
                            }
                        },
                        404: {
                            description: 'Todo not found'
                        }
                    }
                },
                delete: {
                    summary: 'Delete a todo',
                    tags: ['Todos'],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        204: {
                            description: 'Todo deleted successfully'
                        },
                        404: {
                            description: 'Todo not found'
                        }
                    }
                }
            }
        },
        components: {
            schemas: todoSchemas
        }
    });
});

// API Routes
app.get('/todos', async (c) => {
    const todos = await todoService.getAllTodos();
    return c.json(todos);
});

app.get('/todos/:id', async (c) => {
    const id = Number(c.param('id'));
    const todo = await todoService.getTodoById(id);
    
    if (!todo) {
        return c.json({ message: 'Todo not found' }, 404);
    }
    
    return c.json(todo);
});

app.post('/todos', async (c) => {
    const body = await c.req.json();
    const todo = await todoService.createTodo(body);
    return c.json(todo, 201);
});

app.put('/todos/:id', async (c) => {
    const id = Number(c.param('id'));
    const body = await c.req.json();
    
    const todo = await todoService.updateTodo(id, body);
    if (!todo) {
        return c.json({ message: 'Todo not found' }, 404);
    }
    
    return c.json(todo);
});

app.delete('/todos/:id', async (c) => {
    const id = Number(c.param('id'));
    const deleted = await todoService.deleteTodo(id);
    
    if (!deleted) {
        return c.json({ message: 'Todo not found' }, 404);
    }
    
    return new Response(null, { status: 204 });
});

// Start the server
const port = 3000;
export default {
    port,
    fetch: app.fetch
};

console.log(`🚀 Server running at http://localhost:${port}`);
console.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);