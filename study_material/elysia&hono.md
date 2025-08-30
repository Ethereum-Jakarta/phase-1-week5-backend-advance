# Elysia vs Hono
Bun memiliki beberapa framework yang sangat bagus dalam membuat API salahsatunya yaitu Elysia dan Hono. kali ini kita akan membahas tentang kedua hal berikut

Elysia dan Hono adalah dua framework web modern yang dirancang untuk membangun aplikasi web dengan performa tinggi dan efisiensi. Keduanya menawarkan pendekatan yang berbeda dalam pengembangan aplikasi, dengan keunggulan dan fitur unik masing-masing.

## Elysia
Elysia adalah framework web yang dibangun di atas runtime Bun, dirancang untuk memberikan pengalaman pengembangan yang ergonomis dan efisien.

### Keunggulan Elysia
- **Performa Tinggi**: Elysia diklaim 21 kali lebih cepat daripada Express.js, menjadikannya salah satu framework TypeScript dengan kinerja terbaik, sebanding dengan bahasa seperti Go dan Rust. 
SANTRI KODING

- **Keamanan Tipe End-to-End**: Elysia memanfaatkan TypeScript secara maksimal dengan sistem tipe terintegrasi dan inferensi tipe otomatis, memastikan keamanan tipe pada runtime dan compile time.

- **Pengalaman Pengembang yang Ergonomis**: Dirancang untuk meminimalkan boilerplate dan konfigurasi, Elysia fokus pada kemudahan penggunaan dan produktivitas pengembang.

- **Fitur Lengkap**: Menyediakan fitur seperti routing, validasi, middleware, dan lainnya untuk membangun API web modern.

### Contoh Setup project pada Todos

1. Buatlah Directory project api 
```
mkdir todo-api
cd todo-api
bun init
```

2. Install dependencies
```
bun add elysia @elysiajs/swagger @elysiajs/cors
bun add -d bun-types
```

3. buatlah structure folder seperti ini
```
todo-api/
├── src/
│   ├── controllers/
│   │   └── todo.controller.ts
│   ├── services/
│   │   └── todo.service.ts
│   ├── models/
│   │   └── todo.model.ts
│   ├── schemas/
│   │   └── todo.schema.ts
│   ├── plugins/
│   │   └── db.plugin.ts
│   ├── routes/
│   │   └── todo.route.ts
│   └── index.ts
├── tests/
│   └── todo.test.ts
├── .env
├── package.json
└── tsconfig.json
```

4. input code berikut ke dalam folder yang di tentukan
```js
// package.json
{
  "name": "todo-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts"
  },
  "dependencies": {
    "elysia": "latest",
    "@elysiajs/swagger": "latest",
    "@elysiajs/cors": "latest"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```

```js
// src/models/todo.model.ts
export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTodoDTO {
    title: string;
    description?: string;
}

export interface UpdateTodoDTO {
    title?: string;
    description?: string;
    completed?: boolean;
}

```
```js
// src/schemas/todo.schema.ts
import { t } from 'elysia';

export const todoSchema = {
    // Schema for request body when creating a todo
    createTodo: t.Object({
        title: t.String({
            minLength: 1,
            maxLength: 100,
            description: 'The title of the todo'
        }),
        description: t.Optional(t.String({
            maxLength: 500,
            description: 'Optional description of the todo'
        }))
    }),

    // Schema for request body when updating a todo
    updateTodo: t.Partial(t.Object({
        title: t.String({
            minLength: 1,
            maxLength: 100
        }),
        description: t.String({
            maxLength: 500
        }),
        completed: t.Boolean()
    })),

    // Schema for todo responses
    todoResponse: t.Object({
        id: t.Number(),
        title: t.String(),
        description: t.Optional(t.String()),
        completed: t.Boolean(),
        createdAt: t.String(),
        updatedAt: t.String()
    })
};
```
```js
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
```
```js
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
```
```js
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
```
```js
// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { todoController } from './controllers/todo.controller'

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'Todo API Documentation',
                version: '1.0.0',
                description: 'A RESTful API for managing todos built with Elysia and Bun',
                contact: {
                    name: 'API Support',
                    email: 'support@example.com'
                }
            },
            tags: [
                {
                    name: 'Todos',
                    description: 'Todo management endpoints'
                }
            ],
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local development server'
                }
            ]
        },
        path: '/docs',  // This will serve the Swagger UI at /docs
        specification: {
            basePath: '/api/v1',
            securityDefinitions: {
                // You can add authentication documentation here
            }
        }
    }))
    .use(cors())
    .use(todoController)
    .listen(3000)

console.log(`🦊 Todo API is running at ${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 Swagger documentation available at http://localhost:3000/docs`)
```
```js
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
```
5. Running code
```
bun run dev
```

setelah itu kalian bisa mencoba API Todos di dalam swagger
```
Todo API is running at localhost:3000
📚 Swagger documentation available at http://localhost:3000/docs
```

## Hono
Hono adalah framework web ringan dan cepat yang dapat berjalan di berbagai lingkungan seperti Cloudflare Workers, Deno, dan Bun. 

### Keunggulan Hono
- **Ringan dan Cepat**: Dirancang untuk performa tinggi dengan ukuran yang minimal, ideal untuk aplikasi dengan kebutuhan latensi rendah.

- **Dukungan TypeScript**: Hono dibangun dengan TypeScript, memberikan pengetikan statis dan fitur modern yang meningkatkan produktivitas dan mengurangi bug.

- **Fleksibilitas**: Dapat diintegrasikan dengan berbagai teknologi dan layanan, termasuk penyedia cloud dan edge computing.

- **Routing Efisien**: Menyediakan mekanisme routing seperti TrieRouter untuk efisiensi pencocokan pola, cocok untuk aplikasi dengan banyak rute.

## Perbandingan Elysia dan Hono
- **Performa**: Elysia menawarkan performa tinggi dengan integrasi mendalam dengan Bun, sementara Hono memberikan fleksibilitas dengan dukungan untuk berbagai runtime.

- **Ekosistem**: Elysia terintegrasi erat dengan Bun, memanfaatkan fitur-fiturnya untuk performa optimal. Hono, di sisi lain, dapat berjalan di berbagai platform seperti Cloudflare Workers, Deno, dan Bun, memberikan fleksibilitas dalam deployment.

- **Pengalaman Pengembang**: Elysia fokus pada ergonomi dan keamanan tipe end-to-end dengan TypeScript, sedangkan Hono menawarkan API yang sederhana dan intuitif, memudahkan pengembang untuk memulai dengan cepat.

Pemilihan antara Elysia dan Hono bergantung pada kebutuhan spesifik proyek Anda, seperti lingkungan deployment, preferensi bahasa, dan kebutuhan performa.

### Contoh Setup project hono pada API Todos

1. Buat directory project
```
mkdir hono-todo-api
cd hono-todo-api
bun init
```

2. installasi dependencies
```
bun add hono @hono/swagger-ui zod
bun add -d bun-types
```

3. buatlah structure folder seperti ini
```
todo-api/
├── src/
│   ├── controllers/
│   │   └── todo.controller.ts
│   ├── services/
│   │   └── todo.service.ts
│   ├── models/
│   │   └── todo.model.ts
│   ├── schemas/
│   │   └── todo.schema.ts
│   ├── middleware/
│   │   └── error-handler.ts
│   ├── utils/
│   │   └── database.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

4. masukan code berikut ke folder yang sesuai
```js
// package.json
{
  "name": "hono-todo-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts"
  },
  "dependencies": {
    "hono": "latest",
    "@hono/swagger-ui": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```
```js
// src/models/todo.model.ts
// Defining our Todo interfaces for type safety throughout the application
export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTodoDTO {
    title: string;
    description?: string;
}

export interface UpdateTodoDTO {
    title?: string;
    description?: string;
    completed?: boolean;
}
```
```js
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
```
```js
// src/services/todo.service.ts
// Service layer handling business logic and database operations
import { Database } from 'bun:sqlite';
import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/todo.model';
import { TodoDB } from '../utils/database';

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
```
```js
// src/schemas/todo.schema.ts
// OpenAPI schema definitions for Swagger documentation
export const todoSchemas = {
    Todo: {
        type: 'object',
        properties: {
            id: { type: 'integer', description: 'Unique identifier for the todo' },
            title: { type: 'string', description: 'Title of the todo item' },
            description: { type: 'string', description: 'Detailed description of the todo' },
            completed: { type: 'boolean', description: 'Completion status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'title', 'completed']
    },
    CreateTodoBody: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 }
        },
        required: ['title']
    },
    UpdateTodoBody: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            completed: { type: 'boolean' }
        }
    }
};
```
```js
// src/middleware/error-handler.ts
// Global error handling middleware
import { Context, Next } from 'hono';

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        console.error('Error:', error);
        return c.json(
            { message: 'Internal Server Error' },
            500
        );
    }
}
```
```js
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
```

5. jalankan project API Todos
```
bun run dev
```
setelah itu kalian bisa mengakses docs nya
```
http://localhost:3000/docs
```