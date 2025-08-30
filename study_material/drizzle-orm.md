# ORM Drizzle

## 1. Apa itu ORM?
ORM (Object-Relational Mapping) adalah teknik pemrograman yang memungkinkan pengembang untuk berinteraksi dengan database relasional menggunakan objek dalam kode, alih-alih menulis query SQL secara manual. Dengan ORM, pengembang dapat bekerja dengan data dalam bentuk objek dan ORM akan mengelola proses konversi antara objek dan database relasional.

## 2. Apa itu Drizzle ORM?
Drizzle ORM adalah TypeScript ORM (Object-Relational Mapping) yang berfokus pada keamanan tipe dan pengalaman pengembang. Drizzle ORM menyediakan pembuat query yang modern dengan dukungan TypeScript penuh, menjadikannya pilihan yang sangat baik untuk aplikasi modern. Tidak seperti ORM tradisional, Drizzle mengambil pendekatan yang lebih mengutamakan SQL sambil tetap menjaga kenyamanan bekerja dengan objek dalam kode Anda.

Drizzle menyediakan API yang cukup intuitif dan tidak memerlukan banyak boilerplate code untuk bekerja dengan data dalam database.

## Fitur dan Keunggulan
Drizzle ORM menonjol karena beberapa alasan:

- **Keamanan Tipe**: Setiap query yang kalian tulis diketik sepenuhnya, membantu menangkap kesalahan pada waktu kompilasi
- **Pembuat query mirip SQL**: Sintaksisnya sangat mirip SQL, membuatnya intuitif bagi pengembang SQL
- **Kinerja**: Overhead minimal dibandingkan dengan query SQL mentah
- **Deklarasi Skema**: Definisi skema yang jelas dan aman terhadap tipe
- **Migrasi**: Dukungan bawaan untuk migrasi basis data
- **Fitur PostgreSQL**: Dukungan luar biasa untuk fitur khusus PostgreSQL

# Penggunaan Drizzle ORM

## 1. Definisi Schema
```js
import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

// Define tabel user
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow()
});

// Define tabel post dengan relation
export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    authorId: integer('author_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});
```

## 2. Operasi query

- Select Queries
```js
// Basic select
const allUsers = await db.select().from(users);

// Select dengan kondisi
const activeUsers = await db.select()
    .from(users)
    .where(eq(users.isActive, true));

// Joins
const userPosts = await db.select()
    .from(users)
    .leftJoin(posts, eq(users.id, posts.authorId));
```

- Insert Operastion
```js
// Single insert
const newUser = await db.insert(users)
    .values({
        email: 'john@example.com',
        name: 'John Doe'
    })
    .returning();

// Bulk insert
const newUsers = await db.insert(users)
    .values([
        { email: 'alice@example.com', name: 'Alice' },
        { email: 'bob@example.com', name: 'Bob' }
    ])
    .returning();
```

- Update Operations
```js
// Update records
const updated = await db.update(users)
    .set({ isActive: false })
    .where(eq(users.email, 'john@example.com'))
    .returning();
```

- Delete Operations
```js
// Delete records
const deleted = await db.delete(users)
    .where(eq(users.email, 'john@example.com'))
    .returning();
```

## 3. Relations and Joins
```js
// Define relations
const getUserWithPosts = await db.select()
    .from(users)
    .leftJoin(posts, eq(users.id, posts.authorId));

// Using the relation object
const relations = {
    posts: many(posts)
};

// Get user with their posts
const userWithPosts = await db.query.users.findFirst({
    with: {
        posts: true
    },
    where: eq(users.id, 1)
});
```

## 4. Migrations
```js
// migrations/0000_initial.ts
import { sql } from 'drizzle-orm';

export const up = sql`
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
    );
`;

export const down = sql`
    DROP TABLE users;
`;
```

# Project study
ok sekarang kalian akan mencoba untuk membuat API dengan **BUN** + **Drizzle ORM**+ **Neon DB Postgre**

## 1. Setup Project

ok pertama kalian buat project directory terlebih dahulu

```
mkdir bun-blog-api
cd bun-blog-api
bun init
```

kemudian install dependencies yang akan di gunakan

```
bun add drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit bun-types
```

kalian atur directory folder project kalian seperti ini
```
// Project structure
project/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   └── posts.ts
│   │   ├── migrations/
│   │   │   └── 0000_initial.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── user.services.ts
│   │   └── post.services.ts
│   ├── utils/
│   │   └── response.ts
│   └── index.ts
├── drizzle.config.ts
├── .env
└── package.json
```

dan tambahkan cariable untuk konneksi API ke dalam database NEON DB 
```
// Ini hanya contoh

DATABASE_URL=postgres://user:password@ep-example-123456.us-east-2.aws.neon.tech/dbname?sslmode=require
```

## 2. Code

- package.json
```json
// package.json
{
  "name": "bun-blog-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.6.0",
    "dotenv": "^16.4.7",
    "drizzle-orm": "^0.38.3",
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.1",
    "bun-types": "latest"
  }
}
```

- src/db/schema/users.ts
```js
// src/db/schema/users.ts
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow()
});
```

- src/db/schema/posts.ts
```js
// src/db/schema/posts.ts
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    authorId: integer('author_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});
```

```js
// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create a database connection using Neon's serverless driver
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- src/utils/response.ts
```js
// src/utils/response.ts
export class ApiResponse {
    static json(data: any, status: number = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }
}
```

- src/services/user.services.ts
```js
// src/services/user.services.ts
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UserService {
    async getAllUsers() {
        return await db.select().from(users);
    }

    async getUserById(id: number) {
        const result = await db.select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return result[0];
    }

    async createUser(data: { email: string; name: string }) {
        const result = await db.insert(users)
            .values(data)
            .returning();
        return result[0];
    }

    async updateUser(id: number, data: Partial<{ email: string; name: string; isActive: boolean }>) {
        const result = await db.update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }

    async deleteUser(id: number) {
        const result = await db.delete(users)
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }
}
```

- src/services/post.services.ts
```
// src/services/post.service.ts
import { db } from '../db';
import { posts } from '../db/schema/posts';
import { eq } from 'drizzle-orm';

export class PostService {
    async getAllPosts() {
        return await db.select().from(posts);
    }

    async getPostById(id: number) {
        const result = await db.select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);
        return result[0];
    }

    async createPost(data: { title: string; content: string; userId: number }) {
        const result = await db.insert(posts)
            .values(data)
            .returning();
        return result[0];
    }

    async updatePost(id: number, data: Partial<{ title: string; content: string; isPublished: boolean }>) {
        const result = await db.update(posts)
            .set(data)
            .where(eq(posts.id, id))
            .returning();
        return result[0];
    }

    async deletePost(id: number) {
        const result = await db.delete(posts)
            .where(eq(posts.id, id))
            .returning();
        return result[0];
    }
}
```

- src/index.ts
```js
// src/index.ts
import { UserService } from './services/user.services';
import { PostService } from './services/post.services';
import { ApiResponse } from './utils/response';

// Initialize services
const userService = new UserService();
const postService = new PostService();

// Create the server
const server = Bun.serve({
    port: process.env.PORT || 3000,
    async fetch(req) {
        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        try {
            // Users endpoints
            if (path.startsWith('/api/users')) {
                const id = path.split('/')[3]; // Get ID from path if present

                // GET /api/users
                if (method === 'GET' && !id) {
                    const users = await userService.getAllUsers();
                    return ApiResponse.json(users);
                }

                // GET /api/users/:id
                if (method === 'GET' && id) {
                    const user = await userService.getUserById(Number(id));
                    if (!user) {
                        return ApiResponse.json({ error: 'User not found' }, 404);
                    }
                    return ApiResponse.json(user);
                }

                // POST /api/users
                if (method === 'POST') {
                    const body = await req.json();
                    const user = await userService.createUser(body);
                    return ApiResponse.json(user, 201);
                }

                // PUT /api/users/:id
                if (method === 'PUT' && id) {
                    const body = await req.json();
                    const user = await userService.updateUser(Number(id), body);
                    if (!user) {
                        return ApiResponse.json({ error: 'User not found' }, 404);
                    }
                    return ApiResponse.json(user);
                }

                // DELETE /api/users/:id
                if (method === 'DELETE' && id) {
                    const user = await userService.deleteUser(Number(id));
                    if (!user) {
                        return ApiResponse.json({ error: 'User not found' }, 404);
                    }
                    return new Response(null, { status: 204 });
                }
            }

            // Posts endpoints
            if (path.startsWith('/api/posts')) {
                const id = path.split('/')[3]; // Get ID from path if present

                // GET /api/posts
                if (method === 'GET' && !id) {
                    const posts = await postService.getAllPosts();
                    return ApiResponse.json(posts);
                }

                // GET /api/posts/:id
                if (method === 'GET' && id) {
                    const post = await postService.getPostById(Number(id));
                    if (!post) {
                        return ApiResponse.json({ error: 'Post not found' }, 404);
                    }
                    return ApiResponse.json(post);
                }

                // POST /api/posts
                if (method === 'POST') {
                    const body = await req.json();
                    const post = await postService.createPost(body);
                    return ApiResponse.json(post, 201);
                }

                // PUT /api/posts/:id
                if (method === 'PUT' && id) {
                    const body = await req.json();
                    const post = await postService.updatePost(Number(id), body);
                    if (!post) {
                        return ApiResponse.json({ error: 'Post not found' }, 404);
                    }
                    return ApiResponse.json(post);
                }

                // DELETE /api/posts/:id
                if (method === 'DELETE' && id) {
                    const post = await postService.deletePost(Number(id));
                    if (!post) {
                        return ApiResponse.json({ error: 'Post not found' }, 404);
                    }
                    return new Response(null, { status: 204 });
                }
            }

            // Handle 404 for unknown routes
            return ApiResponse.json({ error: 'Not Found' }, 404);

        } catch (error) {
            console.error('Error:', error);
            return ApiResponse.json({ error: 'Internal Server Error' }, 500);
        }
    }
});

console.log(`Server running at http://localhost:${server.port}`);

```

- drizzle.config.ts
```js
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  dialect: "postgresql",
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  dbCredentials: {
      url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config;
```

## 4. Running code
sebelum kalian jalankan projectnya, kalian harus migrasi dulu database kalian. disini lah peran drizzle untuk mengintegrasikan aplikasi ke database kalian. pertama kita akan generate schema dengan
```
bun run db:generate
// atau
drizzle-kit generate:pg
```
jika berjalan akan muncul seperti ini.
![image](https://github.com/user-attachments/assets/a3291518-1488-46d2-ad9d-cf3b8d6ef4fd)

jika berhasil file migrasi nya akan muncul di `src/db/migrations` kurang lebih seperti ini
![image](https://github.com/user-attachments/assets/67dd3ede-9725-4340-a24b-179f3da4b8d8)

dan di ada sebuah file seperti `0000_outstanding_gargoyle` ini jika dilihat file ini dalam bentuk sql. itu adalah hasil dari generate shcema yang kita buat.

jika sudah seperti ini tinggal kita push saja
```
bun run db:push
```

baru lalu kalian bisa jalankan projectnya
```
bun run dev
```
dan hasilnya akan seperti ini
![image](https://github.com/user-attachments/assets/1403bd6e-ff81-474e-89fd-873a23876217)

jika sudah berhasil kalian bisa mengecheck db table kalian di website neonDb kalian dan akan muncul dbnya
![image](https://github.com/user-attachments/assets/f58cfee1-4c8d-4869-8044-c9ec15b5885c)

lalu kalian tinggal jalankan program kalain `bun dev` dan aplikasi akan bekerja


