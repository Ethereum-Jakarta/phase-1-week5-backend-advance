# Microservice asyncronous (RPN Library)
pada materi ini kalian akan di arahkan untuk membuat API library dengan structure microservice di project anda.

Technologi yang akan di pakai adalah: 

1. **Runtime & Package Manager**

- Bun.js - JavaScript/TypeScript runtime dan package manager
- Node.js - Sebagai runtime alternatif
- PM2 - Process Manager untuk menjalankan multiple services

2. **Database & ORM**

- PostgreSQL - Database utama
- Drizzle ORM - ORM untuk PostgreSQL
- Multiple Schema - Satu database dengan multiple schema per service


3. **Framework & Libraries**

- Elysia.js - Web framework untuk Bun.js
- @elysiajs/swagger - Swagger/OpenAPI documentation
- @elysiajs/jwt - JWT authentication
- @elysiajs/cors - CORS handling


4. **Message Queue & Communication**

- CloudAMQP (RabbitMQ) - Message broker untuk komunikasi antar service
- Nodemailer - Untuk mengirim email notifications

5. **Authentication & Security**

- JWT (JSON Web Tokens) - Untuk authentication
- bcrypt - Password hashing


6. **Architecture Pattern**

- Microservices Architecture
- API Gateway Pattern
- Event-Driven Architecture (via RabbitMQ)
- Repository Pattern
- Service Pattern

## Preparing
Sebelum kalian memulai project ini lebih baik menyiapkan tools2 yang akan di pakai terlebih dahulu seperti:
- neonDB
- RabbitMQ / kafka
- smtp mailer

### 1. Neon DB
untuk menyiapkanya neon DB kalian hanya perlu login ke websitenya [Neon.Tech](https://neon.tech) dan mengambil link dbnya saja.

### 2. RabitMQ / kafka
untuk yang satu ini kalian di anjurkan memerlukan docker untuk menjalankannya, jika tidak kalian bisa menggunakan cloud geratis seperti [cloudAMQP](https://www.cloudamqp.com/)

### 3. SMTP mailer
untuk ini kalian bisa menggunakan [sendgrid](https://sendgrid.com/en-us/free), [mailtrap](https://mailtrap.io/blog/free-smtp-servers/) atau [smtpserver](https://smtpserver.com/smtp-server-free)

## Project Architecture
inilah bentuk library sistem ASCII Architecture yang akan kalian buat

```
                        +------------------+
                        |   API Gateway    |
                        | (Routing Layer)  |
                        +------------------+
                                |
        +---------------------+-----------------------+---------------------+
        |                     |                       |                    |
+------------------+ +------------------+  +------------------+  +------------------+
|   User Service   | | Catalog Service  |  | Borrowing Service|  |  Review Service  |
|  (Microservice)  | |  (Microservice)  |  |  (Microservice)  |  |  (Microservice)  |
+------------------+ +------------------+  +------------------+  +------------------+
        |                   |                      |                    |
        +-------------------+----------------------+--------------------+
                                    |
                           +------------------+
                           |   PostgreSQL     |
                           |    Database      |
                           +--------+---------+
                                    |
                    +---------------+----------------+
                    |               |                |
            +--------------+ +--------------+ +--------------+
            | User Schema  | |Catalog Schema| |Borrow Schema |
            |(user_service)| |  (catalog)   | | (borrowing)  |
            +--------------+ +--------------+ +--------------+
                    |               |                |
                    +---------------+----------------+
                                   |
                           +------------------+
                           |    RabbitMQ      |
                           | (Message Broker)  |
                           +------------------+
                                    |
                           +------------------+
                           |  Notification    |
                           |    Service       |
                           +------------------+
                                    |
                           +------------------+
                           |   Email Service  |
                           |    (External)    |
                           +------------------+
```
pada Architecture ini kalian akan membuat microservice dimana setiap service memiliki database yang sama tetapi berbeda schema


## Folder Project
untuk folder project kalian kurang lebih akan seperti ini nantinya

```
digital-library/
├── .env
├── .env.example
├── .gitignore
├── ecosystem.config.js
├── package.json
├── README.md
│
├── scripts/
│   ├── check-services.ts
│   ├── install-dependencies.bat
│   ├── install-dependencies.sh
│   ├── migrate-all.bat
│   ├── migrate-all.sh
│   ├── start-services.bat
│   └── start-services.sh
│
├── services/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── services.ts
│   │   │   │   └── config.ts
│   │   │   ├── db/
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── logger.ts
│   │   │   ├── routes/
│   │   │   │   └── proxies.ts
│   │   │   ├── swagger/
│   │   │   │   └── config.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   └── config.ts
│   │   │   ├── db/
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── models/
│   │   │   │   └── schema.ts
│   │   │   ├── routes/
│   │   │   │   └── userRoutes.ts
│   │   │   ├── services/
│   │   │   │   └── userService.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── catalog-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── db/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── borrowing-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── amqp.ts
│   │   │   ├── db/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── review-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── db/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── notification-service/
│       ├── src/
│       │   ├── config/
│       │   │   └── amqp.ts
│       │   ├── db/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   │   └── emailService.ts
│       │   ├── templates/
│       │   │   └── emailTemplates.ts
│       │   └── index.ts
│       ├── .env
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
```

setelah kalian lihat kita akan memiliki 5 service yaitu:
### Penjelasan masing-masing service
1. **User Service**

user service ini di khususkan untuk membuat service khusus untuk user seperti `register`, `login`, `getUserById`, `editUser`. dan untuk userservice ini memiliki schemanya sendiri seperti yang di beritahu sebelumnya

2. **Catalog Service**

catalog service ini di khususkan untuk service yang berhubungan dengan Buku seperti `registerBook`, `findBookById`, `getAllBook`, dan bisa juga berhubungan dengan categories seperti `createCategories`, `getAllCategories`, `editCategories`, getCate`goriesById.

3. **Borowing Service**

Borowing service ini di khususkan untuk membuat service khusus loan seperti `createLoan`, `getAllLoans`, `getUserLoans`, `returnBook`, `checkOverdueLoans`

4. **Review Service**

Review service ini di buat untuk membuat fitur2 review pada buku seperti `createReview`, `getBookReviews`, `getUserReviews`, `updateReview`, `deleteReview`.

5. **Notification Service**

Notification Service ini dibuat khusus untuk mengirimkan notifikasi ke email saat melalukan peminjaman buku atau pengembalian buku

6. **API Gateway**

API gateway ini Dibuat untuk menyatukan semua API service ke dalam satu server agar mudah di jalankan


## Wrtie the Code
Sekarang mari kita program semua service satu-satu

### 1. User Service
pertama masuk ke directory user-service
```
cd service/user-service
```

lalu inisialisasi service dengan menjalankan
```
bun init
```
masukan code ini ke dalam package.json
```json
{
  "name": "user-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "bcrypt": "^5.1.1",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "postgres": "latest"
  },
  "devDependencies": {
    "bun-types": "latest",
    "drizzle-kit": "latest",
    "dotenv": "^16.4.7"
  }
}
```
lalu install dependencies
```
bun install
```

lalu buat structure project folder untuk service kalian seperti ini
```
user-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   └── config.ts
│   │   │   ├── db/
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── models/
│   │   │   │   └── schema.ts
│   │   │   ├── routes/
│   │   │   │   └── userRoutes.ts
│   │   │   ├── services/
│   │   │   │   └── userService.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
```

mari mulai dari `drizzle.config.ts` dan `.env`
- drizzle.config.ts
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/models/*',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config
```

- .env
```
DATABASE_URL="url neon db"
JWT_SECRET=randomparanolep
```
jangan lupa masukan databse url neon kalian

lalu ke ke folder config
- src/config/config.ts
``` ts
// src/config/config.ts
export const dbConfig = {
  url: process.env.DATABASE_URL || 'postgres://[your-neon-connection-string]',
  schema: 'user_service'
}
```
- src/config/database.ts
```ts
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Konfigurasi untuk Neon
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  ssl: true, // Wajib untuk Neon DB
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(sql)
```

lalu folder db
- src/db/migrate.ts
```ts
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config()

const runMigration = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  const db = drizzle(sql)

  console.log('Creating schema if not exists...')
  await sql`CREATE SCHEMA IF NOT EXISTS user_service;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

lalu ke middleware

- src/middleware/errorHandler.ts
```ts
// src/middleware/errorHandler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, set }: any) => {
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { error: 'Not Found' }
      case 'VALIDATION':
        set.status = 400
        return { error: 'Validation Error', details: error.message }
      default:
        set.status = 500
        return { error: 'Internal Server Error' }
    }
  })
```

lalu folder models
- src/models/schema.ts
```ts
// src/models/schema.ts
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

// Define schema name
const schema = 'public'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: schema
  }
})
```

folder routes
- src/routes/userRoutes.ts
```ts
// src/routes/userRoutes.ts
import { Elysia, t } from 'elysia'
import { UserService } from '../services/userServices'

const userService = new UserService()

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .post('/register', async ({ body }) => {
    return await userService.createUser(body)
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  
  // @ts-ignore
  .post('/login', async ({ body, jwt }) => {
    const user = await userService.loginUser(body.email, body.password)
    const token = await jwt.sign({ id: user.id })
    return { user, token }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  
  // @ts-ignore
  .get('/:id', async ({ params, jwt }) => {
    return await userService.getUserById(Number(params.id))
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  .put('/:id', async ({ params, body }) => {
    return await userService.updateUser(Number(params.id), body)
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      username: t.Optional(t.String()),
      email: t.Optional(t.String()),
      password: t.Optional(t.String())
    })
  })
```
folder services
- src/services/userService.ts
```ts
// src/services/userService.ts
import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { users } from '../models/schema'
import { hash, compare } from 'bcrypt'

export class UserService {
  async createUser(userData: any) {
    try {
        const hashedPassword = await hash(userData.password, 10);
        const user = await db.insert(users).values({
            ...userData,
            password: hashedPassword,
        }).returning();
        return user;
    } catch (error) {
        console.error('Error in createUser:', error);
        throw new Error('Failed to create user');
    }
  }

  async loginUser(email: string, password: string) {
    try {
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user.length) {
            throw new Error('User not found');
        }

        const isValid = await compare(password, user[0].password);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        return user[0];
    } catch (error) {
        console.error('Error in loginUser:', error);
        throw new Error('Failed to login user');
    }
  }

  async getUserById(id: number) {
    try {
        const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user.length) {
            throw new Error('User not found');
        }
        return user[0];
    } catch (error) {
        console.error('Error in getUserById:', error);
        throw new Error('Failed to fetch user');
      }
}

  async updateUser(id: number, userData: any) {
    try {
        if (userData.password) {
            userData.password = await hash(userData.password, 10);
        }
        const updatedUser = await db.update(users)
            .set(userData)
            .where(eq(users.id, id))
            .returning();
        return updatedUser;
    } catch (error) {
        console.error('Error in updateUser:', error);
        throw new Error('Failed to update user');
    }
  }

}
```

- src/index.ts
```ts
// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { userRoutes } from './routes/userRoutes'
import { errorHandler } from './middleware/errorHandler'
import { cors } from '@elysiajs/cors'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'User Service API',
        version: '1.0.0'
      }
    }
  }))
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .use(errorHandler)
  .use(userRoutes)
  .listen(3001)

console.log(`🦊 User service is running at ${app.server?.hostname}:${app.server?.port}`)
```

jika sudah kalian bisa coba dengan menjalankan terminal berikut
```
bun run db:generate
bun run db:migrate
bun run dev
```

code di atas dijalankan untuk
- `db:generate`: untuk menggenerate schema menggunakan drizzle
- `db:migrate`: memasukan schema database yang kita generate tadi ke dalam
database
- `bun run dev`: menjalankan code di terminal

jika berhasil maka akan muncul log dengan server port 3001, dan jika ingin mencobanya menggunakan
maka masuke ke `localhost:3001/docs`

dan setelah itu mari kita buat unit test untuk service kita.
bun memiliki library testnya sendiri jadi kalian tidak perlu menggunakan jest untuk project ini.

untuk setup nya mari buat file tests pada project kalian

```
mkdir tests
```
pertama buat setup.ts untuk database mocknya

```ts
// tests/setup.ts
import { mock } from "bun:test";

// Global mock for bcrypt
mock.module('bcrypt', () => ({
  hash: () => Promise.resolve('hashed_password_123'),
  compare: () => Promise.resolve(true)
}));

// Global mock for database if needed
mock.module('../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: () => []
      })
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => []
        })
      })
    })
  }
}));
```

lalu buat test untuk service

```
mkdir tests/unit/userService.test.ts
```

lalu masukan code untuk testing serperti berikut

```ts
// tests/unit/services/userService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { UserService } from '../../../src/services/userServices';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();

    // Mock bcrypt globally
    mock.module('bcrypt', () => ({
      hash: async (data: string) => 'hashed_' + data,
      compare: async (data: string, hash: string) => hash === 'hashed_' + data
    }));
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{
                id: 1,
                username: userData.username,
                email: userData.email,
                password: 'hashed_' + userData.password,
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            })
          })
        }
      }));

      const result = await userService.createUser(userData);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].username).toBe(userData.username);
      expect(result[0].email).toBe(userData.email);
      expect(result[0].password).toStartWith('hashed_');
    });

    it('should throw error if user creation fails', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => {
            throw new Error('Database error');
          }
        }
      }));

      await expect(userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('Failed to create user');
    });

    it('should throw error if email already exists', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => {
            throw new Error('duplicate key value violates unique constraint');
          }
        }
      }));

      await expect(userService.createUser({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      })).rejects.toThrow('Failed to create user');
    });
  });

  describe('loginUser', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [{
                  id: 1,
                  email: loginData.email,
                  password: 'hashed_' + loginData.password,
                  username: 'testuser'
                }]
              })
            })
          })
        }
      }));

      const result = await userService.loginUser(loginData.email, loginData.password);
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(loginData.email);
    });

    it('should throw error if password is incorrect', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [{
                  id: 1,
                  email: 'test@example.com',
                  password: 'hashed_correctpassword',
                  username: 'testuser'
                }]
              })
            })
          })
        }
      }));

      await expect(userService.loginUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Failed to login user');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockUser]
              })
            })
          })
        }
      }));

      const result = await userService.getUserById(1);
      // @ts-ignore
      expect(result).toEqual(mockUser);
    });

    
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{
                  id: 1,
                  ...updateData,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }]
              })
            })
          })
        }
      }));

      const result = await userService.updateUser(1, updateData);
      expect(result[0].username).toBe(updateData.username);
      expect(result[0].email).toBe(updateData.email);
    });

    it('should update password if provided', async () => {
      const updateData = {
        password: 'newpassword123'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{
                  id: 1,
                  password: 'hashed_' + updateData.password,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }]
              })
            })
          })
        }
      }));

      const result = await userService.updateUser(1, updateData);
      expect(result[0].password).toStartWith('hashed_');
    });

    it('should throw error if update fails', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => {
            throw new Error('Update failed');
          }
        }
      }));

      await expect(userService.updateUser(1, { username: 'newname' }))
        .rejects.toThrow('Failed to update user');
    });
  });
});

```

lalu untuk menjalankan testnya kalian bisa menambahkan script pada package.json kalian seperti ini

```json
"scripts": {
  "test": "bun test",
  "test:watch": "bun test --watch",
},
```

atau kalian bisa langsung menjalankan command di terminal

```
bun test
bun test --watch
```

### 2. Catalog Service

lalu untuk service ke dua ini kita akan membuat Catalog Service untuk list2 buku yg akan ada pada perpustakaan kita

pertama masuk ke directory Catalog-service jiia belom masuk
```
cd service/Catalog-service
```

lalu inisialisasi service dengan menjalankan
```
bun init
```

masukan code ini ke dalam package.json
```json
{
  "name": "catalog-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "bcrypt": "^5.1.1",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "jsonwebtoken": "^9.0.2",
    "postgres": "latest"
  },
  "devDependencies": {
    "bun-types": "latest",
    "drizzle-kit": "latest",
    "dotenv": "^16.4.7"
  }
}
```
lalu install dependencies
```
bun install
```

mari mulai dari `drizzle.config.ts` dan `.env`
- drizzle.config.ts
```
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/models/*',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config
```

- .env
```
DATABASE_URL="url neon db"
JWT_SECRET=randomparanolep
```
jangan lupa masukan databse url neon kalian

lalu ke ke folder config
- src/config/config.ts
``` ts
// src/config/config.ts
export const dbConfig = {
  url: process.env.DATABASE_URL || 'postgres://[your-neon-connection-string]',
  schema: 'user_service'
}
```
- src/config/database.ts
```ts
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Konfigurasi untuk Neon
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  ssl: true, // Wajib untuk Neon DB
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(sql)
```

lalu folder db
- src/db/migrate.ts
```ts
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config()

const runMigration = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  const db = drizzle(sql)

  console.log('Creating schema if not exists...')
  await sql`CREATE SCHEMA IF NOT EXISTS catalog_service;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

lalu ke middleware

- src/middleware/errorHandler.ts
```ts
// src/middleware/errorHandler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, set }: any) => {
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { error: 'Not Found' }
      case 'VALIDATION':
        set.status = 400
        return { error: 'Validation Error', details: error.message }
      default:
        set.status = 500
        return { error: 'Internal Server Error' }
    }
  })
```

- src/middleware/auth.ts
```ts
// src/middleware/auth.ts
export const authMiddleware = async ({ request, set }: any) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized - No token provided' }
  }

  try {
    const token = authHeader.split(' ')[1]
    
    // Ensure we're preserving the authorization header
    if (!request.headers.has('authorization')) {
      request.headers.set('authorization', authHeader)
    }
    
    return // Just continue to the next handler
  } catch (error) {
    set.status = 401
    return { error: 'Invalid token' }
  }
}
```

lalu folder models
- src/models/schema.ts
```ts
// src/models/schema.ts
import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'

// Specify schema name for catalog service
const catalogSchema = 'public'

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 100 }).notNull(),
  isbn: varchar('isbn', { length: 13 }).notNull().unique(),
  description: text('description'),
  categoryId: integer('category_id'),
  totalCopies: integer('total_copies').notNull().default(0),
  availableCopies: integer('available_copies').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: catalogSchema
  }
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: catalogSchema
  }
})
```

folder routes
- src/routes/bookRoutes.ts
```ts
// src/routes/bookRoutes.ts
import { Elysia, t } from 'elysia'
import { BookService } from '../services/bookService'
import { authMiddleware } from '../middleware/auth'

const bookService = new BookService()

export const bookRoutes = new Elysia({ prefix: '/api/books' })
  .get('/', async ({ query }: any) => {
    const { page = 1, limit = 10, search } = query
    return await bookService.getBooks(Number(page), Number(limit), search)
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String())
    })
  })

  .get('/:id', async ({ params }: any) => {
    return await bookService.getBookById(Number(params.id))
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .post('/', async ({ body }: any) => {
    const result = await bookService.createBook(body)
    return result[0] // Return full book object instead of array
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      title: t.String(),
      author: t.String(),
      isbn: t.String(),
      description: t.Optional(t.String()),
      categoryId: t.Optional(t.Number()),
      totalCopies: t.Number(),
      availableCopies: t.Number()
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await bookService.updateBook(Number(params.id), body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      title: t.Optional(t.String()),
      author: t.Optional(t.String()),
      isbn: t.Optional(t.String()),
      description: t.Optional(t.String()),
      categoryId: t.Optional(t.Number()),
      totalCopies: t.Optional(t.Number()),
      availableCopies: t.Optional(t.Number())
    })
  })

  .delete('/:id', async ({ params }: any) => {
    return await bookService.deleteBook(Number(params.id))
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    })
  })
```

- src/routes/categoryRoutes.ts
```ts
// src/routes/categoryRoutes.ts
import { Elysia, t } from 'elysia'
import { CategoryService } from '../services/categoryService'
import { authMiddleware } from '../middleware/auth'

const categoryService = new CategoryService()

export const categoryRoutes = new Elysia({ prefix: '/api/categories' })
  .get('/', async () => {
    return await categoryService.getCategories()
  })

  .get('/:id', async ({ params }: any) => {
    return await categoryService.getCategoryById(Number(params.id))
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .get('/:id/books', async ({ params }: any) => {
    return await categoryService.getBooksInCategory(Number(params.id))
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .post('/', async ({ body }: any) => {
    return await categoryService.createCategory(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String())
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await categoryService.updateCategory(Number(params.id), body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String())
    })
  })

  .delete('/:id', async ({ params }: any) => {
    return await categoryService.deleteCategory(Number(params.id))
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    })
  })
```

folder services
- src/services/bookService.ts
```ts
// src/services/bookService.ts
import { eq, like, sql  } from 'drizzle-orm'
import { db } from '../config/database'
import { books } from '../models/schema'

export class BookService {
  async createBook(bookData: any) {
    try {
        const book = await db.insert(books).values(bookData).returning();
        return book;
    } catch (error) {
        console.error('Error in createBook:', error);
        throw new Error('Failed to create book');
    }
  }

  async getBooks(page: number = 1, limit: number = 10, search?: string) {
    try {
        const offset = (page - 1) * limit;
        let query = db.select().from(books).limit(limit).offset(offset);

        if (search) {
            query = query.where(like(books.title, `%${search}%`));
        }

        const [data, total] = await Promise.all([
            query,
            db.select({ count: sql<number>`count(*)` }).from(books).then(res => Number(res[0].count)),
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Error in getBooks:', error);
        throw new Error('Failed to fetch books');
    }
  }

  async getBookById(id: number) {
    try {
        const book = await db.select().from(books).where(eq(books.id, id)).limit(1);
        if (!book.length) throw new Error('Book not found');
        return book[0];
    } catch (error) {
        console.error('Error in getBookById:', error);
        throw new Error('Failed to fetch book');
    }
  }

  async updateBook(id: number, bookData: any) {
    try {
        const updatedBook = await db.update(books)
            .set(bookData)
            .where(eq(books.id, id))
            .returning();
        return updatedBook;
    } catch (error) {
        console.error('Error in updateBook:', error);
        throw new Error('Failed to update book');
    }
  }

  async deleteBook(id: number) {
    try {
        const deletedBook = await db.delete(books)
            .where(eq(books.id, id))
            .returning();
        return deletedBook;
    } catch (error) {
        console.error('Error in deleteBook:', error);
        throw new Error('Failed to delete book');
    }
  }

  async updateBookCopies(id: number, action: 'borrow' | 'return') {
    try {
        const book = await this.getBookById(id);

        if (action === 'borrow' && book.availableCopies < 1) {
            throw new Error('No copies available');
        }

        const availableCopies = action === 'borrow'
            ? book.availableCopies - 1
            : book.availableCopies + 1;

        const updatedBook = await this.updateBook(id, { availableCopies });
        return updatedBook;
    } catch (error) {
        console.error('Error in updateBookCopies:', error);
        throw new Error('Failed to update book copies');
    }
  }

}
```

- src/services/categoryService.ts
```ts
// src/services/categoryService.ts
import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { categories, books } from '../models/schema'

export class CategoryService {
  async createCategory(data: any) {
    try {
        const category = await db.insert(categories).values(data).returning();
        return category;
    } catch (error) {
        console.error('Error in createCategory:', error);
        throw new Error('Failed to create category');
    }
  }

  async getCategories() {
    try {
        const categoriesList = await db.select().from(categories);
        return categoriesList;
    } catch (error) {
        console.error('Error in getCategories:', error);
        throw new Error('Failed to fetch categories');
    }
  }

  async getCategoryById(id: number) {
    try {
        const category = await db.select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (!category.length) {
            throw new Error('Category not found');
        }

        return category[0];
    } catch (error) {
        console.error('Error in getCategoryById:', error);
        throw new Error('Failed to fetch category');
    }
  }

  async updateCategory(id: number, data: any) {
    try {
        const updatedCategory = await db.update(categories)
            .set(data)
            .where(eq(categories.id, id))
            .returning();
        return updatedCategory;
    } catch (error) {
        console.error('Error in updateCategory:', error);
        throw new Error('Failed to update category');
    }
  }

  async deleteCategory(id: number) {
    try {
        const deletedCategory = await db.delete(categories)
            .where(eq(categories.id, id))
            .returning();
        return deletedCategory;
    } catch (error) {
        console.error('Error in deleteCategory:', error);
        throw new Error('Failed to delete category');
    }
  }

  async getBooksInCategory(id: number) {
    try {
        const booksList = await db.select()
            .from(books)
            .where(eq(books.categoryId, id));
        return booksList;
    } catch (error) {
        console.error('Error in getBooksInCategory:', error);
        throw new Error('Failed to fetch books in category');
    }
  }
}
```

- src/index.ts
```ts
// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'
import { bookRoutes } from './routes/bookRoute'
import { categoryRoutes } from './routes/categoryRoute'
import { errorHandler } from './middleware/errorHandler'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Catalog Service API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  }))
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .use(errorHandler)
  .use(bookRoutes)
  .use(categoryRoutes)
  .listen(3002)

console.log(`🚀 Catalog service is running at ${app.server?.hostname}:${app.server?.port}`)
```

jika sudah kalian bisa coba dengan menjalankan terminal berikut
```
bun run db:generate
bun run db:migrate
bun run dev
```

jika berhasil maka kana berjalan di port 3002

lalu mari kita buat unit test nya seperti sebelumnya

untuk setup nya mari buat file tests pada project kalian

```
mkdir tests
```
pertama buat setup.ts untuk database mocknya

```ts
// tests/setup.ts
import { mock } from "bun:test";

// Global mock for database
mock.module('../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: () => []
      })
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => []
        })
      })
    })
  }
}));
```

lalu buat test untuk service

```
mkdir tests/unit/bookService.test.ts
```

lalu masukan code untuk testing serperti berikut

- testing untuk book service

```ts
// tests/unit/services/bookService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { BookService } from '../../../src/services/bookService';

describe('BookService', () => {
  let bookService: BookService;

  beforeEach(() => {
    bookService = new BookService();
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        totalCopies: 5,
        availableCopies: 5
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{ id: 1, ...bookData }]
            })
          })
        }
      }));

      const result = await bookService.createBook(bookData);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].title).toBe(bookData.title);
    });

    it('should throw error on create book failure', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => {
            throw new Error('Database error');
          }
        }
      }));

      await expect(bookService.createBook({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        totalCopies: 5,
        availableCopies: 5
      })).rejects.toThrow('Failed to create book');
    });
  });

  describe('getBooks', () => {
    it('should return books with pagination', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1' },
        { id: 2, title: 'Book 2', author: 'Author 2' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              limit: () => ({
                offset: () => mockBooks
              })
            })
          }),
          select: () => ({
            from: () => [{
              count: '2'
            }]
          })
        }
      }));

      const result = await bookService.getBooks(1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should handle search parameter', async () => {
      const mockBooks = [
        { id: 1, title: 'Specific Book' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => ({
                  offset: () => mockBooks
                })
              })
            })
          }),
          select: () => ({
            from: () => [{
              count: '1'
            }]
          })
        }
      }));

      const result = await bookService.getBooks(1, 10, 'Specific');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getBookById', () => {
    it('should return a book by id', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockBook]
              })
            })
          })
        }
      }));

      const result = await bookService.getBookById(1);
      expect(result).toEqual(mockBook);
    });

    
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const updateData = {
        title: 'Updated Book',
        author: 'Updated Author'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{ id: 1, ...updateData }]
              })
            })
          })
        }
      }));

      const result = await bookService.updateBook(1, updateData);
      expect(result[0].title).toBe(updateData.title);
    });

    it('should throw error on update failure', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => {
            throw new Error('Update failed');
          }
        }
      }));

      await expect(bookService.updateBook(1, { title: 'New Title' }))
        .rejects.toThrow('Failed to update book');
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          delete: () => ({
            where: () => ({
              returning: () => [{ id: 1 }]
            })
          })
        }
      }));

      const result = await bookService.deleteBook(1);
      expect(result[0]).toHaveProperty('id');
    });

    it('should throw error on delete failure', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          delete: () => {
            throw new Error('Delete failed');
          }
        }
      }));

      await expect(bookService.deleteBook(1))
        .rejects.toThrow('Failed to delete book');
    });
  });

  describe('updateBookCopies', () => {
    it('should update available copies when borrowing', async () => {
      const mockBook = {
        id: 1,
        availableCopies: 2
      };

      // Mock getBookById
      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockBook]
              })
            })
          }),
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{ ...mockBook, availableCopies: 1 }]
              })
            })
          })
        }
      }));

      const result = await bookService.updateBookCopies(1, 'borrow');
      expect(result[0].availableCopies).toBe(1);
    });

    
  });
});
```

lalu buat file untuk category service

```
mkdir tests/unit/categoryService.test.ts
```

- test untuk category service
```ts
// tests/unit/services/categoryService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CategoryService } from '../../../src/services/categoryService';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{ id: 1, ...categoryData }]
            })
          })
        }
      }));

      const result = await categoryService.createCategory(categoryData);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].name).toBe(categoryData.name);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => mockCategories
          })
        }
      }));

      const result = await categoryService.getCategories();
      expect(result).toHaveLength(2);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockCategory]
              })
            })
          })
        }
      }));

      const result = await categoryService.getCategoryById(1);
      expect(result).toEqual(mockCategory);
    });

    
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData = {
        name: 'Updated Category'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{ id: 1, ...updateData }]
              })
            })
          })
        }
      }));

      const result = await categoryService.updateCategory(1, updateData);
      expect(result[0].name).toBe(updateData.name);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          delete: () => ({
            where: () => ({
              returning: () => [{ id: 1 }]
            })
          })
        }
      }));

      const result = await categoryService.deleteCategory(1);
      expect(result[0]).toHaveProperty('id');
    });
  });

  describe('getBooksInCategory', () => {
    it('should return books in category', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', categoryId: 1 },
        { id: 2, title: 'Book 2', categoryId: 1 }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => mockBooks
            })
          })
        }
      }));

      const result = await categoryService.getBooksInCategory(1);
      expect(result).toHaveLength(2);
    });
  });
});
```

lalu untuk menjalankan testnya kalian bisa menambahkan script pada `package.json` kalian seperti ini

```json
"scripts": {
  "test": "bun test",
  "test:watch": "bun test --watch",
},
```

atau kalian bisa langsung menjalankan command di terminal

```
bun test
bun test --watch
```

### 3. Borrowing Service

untuk service ini kita akan menginstall dependencies tambahan dari sebelumnya
```json
{
  "name": "borrowing-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "amqplib": "^0.10.5",
    "bcrypt": "^5.1.1",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "jsonwebtoken": "^9.0.2",
    "postgres": "latest"
  },
  "devDependencies": {
    "@types/amqplib": "^0.10.6",
    "@types/jsonwebtoken": "^9.0.7",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest"
  }
}
```
lalu install dependencies
```
bun install
```

seperti sebulumnya mari mulai dari `drizzle.config.ts` dan `.env`
- drizzle.config.ts
```ts 
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/models/*',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config
```

- .env
```
DATABASE_URL="url neon db"
JWT_SECRET=randomparanolep
CATALOG_SERVICE_URL=http://localhost:3002
CLOUDAMQP_URL="url amqp rmq"
```
jangan lupa masukan databse url neon kalian dan tambahkan port katalog dan amqp

lalu ke ke folder config
- src/config/config.ts
``` ts
// src/config/config.ts
export const dbConfig = {
  url: process.env.DATABASE_URL || 'postgres://[your-neon-connection-string]',
  schema: 'user_service'
}
```
- src/config/database.ts
```ts
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString, { 
  max: 1,
  ssl: true
})

export const db = drizzle(client)
```
- src/config/amqp.ts
```ts
// borrowing-service/src/config/amqp.ts
import amqp from 'amqplib'

let channel: amqp.Channel | null = null

export const getChannel = async () => {
    if (!channel) {
        const connection = await amqp.connect(process.env.CLOUDAMQP_URL!)
        channel = await connection.createChannel()
    }
    return channel
}
```

lalu folder db
- src/db/migrate.ts
```ts
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config()

const runMigration = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  const db = drizzle(sql)

  console.log('Creating schema if not exists...')
  await sql`CREATE SCHEMA IF NOT EXISTS borrowing_service;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

lalu ke middleware

- src/middleware/errorHandler.ts
```ts
// src/middleware/errorHandler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, set }: any) => {
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { error: 'Not Found' }
      case 'VALIDATION':
        set.status = 400
        return { error: 'Validation Error', details: error.message }
      default:
        set.status = 500
        return { error: 'Internal Server Error' }
    }
  })
```

- src/middleware/auth.ts
```ts
// src/middleware/auth.ts
import { verify } from './jwt'

export const authMiddleware = async ({ request, set }: any) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized - No token provided' }
  }

  try {
    const token = authHeader.split(' ')[1]
    const payload = await verify(token)
    return
  } catch (error) {
    set.status = 401
    return { error: 'Invalid token' }
  }
}
```

- src/middleware/jwt.ts
```ts
// src/middleware/jwt.ts
import { verify as jwtVerify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const verify = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwtVerify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
```

lalu folder models
- src/models/schema.ts
```ts
// src/models/schema.ts
import { pgTable, serial, integer, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'

// export const loanStatusEnum = pgEnum('loan_status', ['ACTIVE', 'RETURNED', 'OVERDUE'])

export const loans = pgTable('loans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  bookId: integer('book_id').notNull(),
  borrowDate: timestamp('borrow_date').defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  returnDate: timestamp('return_date'),
  status: text('status', { enum: ['ACTIVE', 'RETURNED', 'OVERDUE'] }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: 'borrowing_service'
  }
})
```

folder routes
- src/routes/loanRoutes.ts
```ts
// src/routes/loanRoutes.ts
import { Elysia, t } from 'elysia'
import { LoanService } from '../services/loanService'
import { authMiddleware } from '../middleware/auth'

const loanService = new LoanService()

export const loanRoutes = new Elysia({ prefix: '/api/loans' })
  .get('/', async ({ query }) => {
    const { page = 1, limit = 10 } = query
    return await loanService.getAllLoans(Number(page), Number(limit),)
  }, {
    beforeHandle: [authMiddleware],
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    })
  })

  .get('/:id', async ({ query, params }) => {
    const { status } = query
    const { id } = params
    return await loanService.getUserLoans(Number(params.id), status)
  }, {
    beforeHandle: [authMiddleware],
    query: t.Object({
      status: t.Optional(t.String())
    })
  })

  .post('/', async ({ body }) => {
    return await loanService.createLoan(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      userId: t.Number(),
      bookId: t.Number()
    })
  })

  .put('/:id/return', async ({ params }) => {
    return await loanService.returnBook(Number(params.id))
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    })
  })

  .get('/overdue', async () => {
    return await loanService.checkOverdueLoans()
  }, {
    beforeHandle: [authMiddleware]
  })
```

folder services
- src/services/loanService.ts
```ts
// src/services/loanService.ts
import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { loans } from '../models/schema'
import { getChannel } from '../config/amqp'

export class LoanService {
  async createLoan(loanData: any) {
    try {
      // Set due date to 14 days from borrow date
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)

      // Check book availability from catalog service
      const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loanData.bookId}`)
      
      if (!bookResponse.ok) { 
          // Handle non-200 response (e.g., 404 Book not found)
          const errorMessage = await bookResponse.json();
          throw new Error(errorMessage.message || 'Error fetching book data');
      }
      
      const book = await bookResponse.json();

      if (!book || book.availableCopies < 1) {
          throw new Error('Book not available');
      }

      const channel = await getChannel()
        await channel.sendToQueue('loan.due', Buffer.from(JSON.stringify({
            userId: loanData.userId,
            bookId: loanData.bookId,
            dueDate
        })))

      // Create loan
      const loan = await db.insert(loans)
        .values({
          ...loanData,
          dueDate,
          status: 'ACTIVE'
        })
        .returning()

      // Update book availability in catalog service
      await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loanData.bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            availableCopies: book.availableCopies - 1
          })
      });

      return loan[0];
    } catch (error) {
      console.error('Error in createLoan:', error);
      throw error; // Propagate the error for further handling
    }
  }


  async getAllLoans(page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;
        let query = db.select().from(loans).limit(limit).offset(offset);

        const [data, total] = await Promise.all([
            query,
            db.select({ count: sql<number>`count(*)` }).from(loans).then(res => Number(res[0].count)),
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Error in getAllLoans:', error);
        throw new Error('Failed to fetch loans');
    }
  }

  async getUserLoans(userId: number, status?: string) {
    try {
        let query = db.select().from(loans).where(eq(loans.userId, userId));

        if (status) {
            query = query.where(eq(loans.status, status));
        }

        const userLoans = await query;
        return userLoans;
    } catch (error) {
        console.error('Error in getUserLoans:', error);
        throw new Error('Failed to fetch user loans');
    }
  }

  async returnBook(loanId: number) {
    try {
        const loan = await db.select()
            .from(loans)
            .where(eq(loans.id, loanId))
            .limit(1);

        if (!loan.length || loan[0].status !== 'ACTIVE') {
            throw new Error('Invalid loan or already returned');
        }

        // Update loan status
        const updatedLoan = await db.update(loans)
            .set({
                returnDate: new Date(),
                status: 'RETURNED',
                updatedAt: new Date(),
            })
            .where(eq(loans.id, loanId))
            .returning();

        // Update book availability in catalog service
        const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loan[0].bookId}`);
        if (!bookResponse.ok) {
            throw new Error('Failed to fetch book data from catalog service');
        }

        const book = await bookResponse.json();

        await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loan[0].bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                availableCopies: book.availableCopies + 1,
            }),
        });

        const channel = await getChannel()
        await channel.sendToQueue('book.returned', Buffer.from(JSON.stringify({
            userId: loan[0].userId,
            bookId: loan[0].bookId
        })))

        return updatedLoan[0];
    } catch (error) {
        console.error('Error in returnBook:', error);
        throw new Error('Failed to return book');
    }
  }

  async checkOverdueLoans() {
    try {
        const now = new Date();
        const overdueLoans = await db.select()
            .from(loans)
            .where(eq(loans.status, 'ACTIVE'))
            .where('due_date', '<', now);

        // Update status to OVERDUE
        for (const loan of overdueLoans) {
            await db.update(loans)
                .set({ status: 'OVERDUE', updatedAt: now })
                .where(eq(loans.id, loan.id));
        }

        return overdueLoans;
    } catch (error) {
        console.error('Error in checkOverdueLoans:', error);
        throw new Error('Failed to check overdue loans');
    }
  }

}
```

- src/index.ts
```ts
// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'
import { loanRoutes } from './routes/loanRoutes'
import { errorHandler } from './middleware/errorHandler'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Borrowing Service API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  }))
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .use(errorHandler)
  .use(loanRoutes)
  .listen(3003)

console.log(`🦊 User service is running at ${app.server?.hostname}:${app.server?.port}`)
```

jika sudah kalian bisa coba dengan menjalankan terminal berikut
```
bun run db:generate
bun run db:migrate
bun run dev
```

jika berhasil maka kana berjalan di port 3003

lalu seperti sebelumnya mari buat file tests pada project untuk service borrowing kalian

```
mkdir tests
```
pertama buat setup.ts untuk database mocknya

```ts
// tests/setup.ts
import { mock } from "bun:test";

// Global mock for bcrypt
mock.module('bcrypt', () => ({
  hash: () => Promise.resolve('hashed_password_123'),
  compare: () => Promise.resolve(true)
}));

// Global mock for database if needed
mock.module('../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: () => []
      })
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => []
        })
      })
    })
  }
}));
```

lalu buat test untuk service

```
mkdir tests/unit/loanService.test.ts
```

lalu masukan code untuk testing serperti berikut

```ts
// tests/unit/services/loanService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { LoanService } from '../../../src/services/loanService';

describe('LoanService', () => {
  let loanService: LoanService;

  beforeEach(() => {
    loanService = new LoanService();
    process.env.CATALOG_SERVICE_URL = 'http://localhost:3002';
  });

  describe('createLoan', () => {
    it('should create loan successfully', async () => {
      const loanData = {
        userId: 1,
        bookId: 1,
      };

      // Mock fetch for book check
      global.fetch = mock(async (url: string, options?: any) => {
        if (url.includes('/api/books/1') && !options?.method) {
          return {
            ok: true,
            json: async () => ({
              id: 1,
              availableCopies: 2
            })
          } as Response;
        }
        // Mock fetch for updating book copies
        if (url.includes('/api/books/1') && options?.method === 'PUT') {
          return {
            ok: true,
            json: async () => ({ success: true })
          } as Response;
        }
        return new Response();
      });

      // Mock RabbitMQ channel
      mock.module('../../../src/config/amqp', () => ({
        getChannel: async () => ({
          sendToQueue: async () => true
        })
      }));

      // Mock database
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{
                id: 1,
                ...loanData,
                status: 'ACTIVE',
                dueDate: new Date(),
                createdAt: new Date()
              }]
            })
          })
        }
      }));

      const result = await loanService.createLoan(loanData);
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw error when book not available', async () => {
      // Mock fetch for book with no copies
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({
          id: 1,
          availableCopies: 0
        })
      } as Response));

      await expect(loanService.createLoan({ userId: 1, bookId: 1 }))
        .rejects.toThrow('Book not available');
    });
  });

  describe('getAllLoans', () => {
    it('should return paginated loans', async () => {
      const mockLoans = [
        { id: 1, userId: 1, bookId: 1, status: 'ACTIVE' },
        { id: 2, userId: 2, bookId: 2, status: 'ACTIVE' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              limit: () => ({
                offset: () => mockLoans
              })
            })
          }),
          select: () => ({
            from: () => [{
              count: '2'
            }]
          })
        }
      }));

      const result = await loanService.getAllLoans(1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });

  describe('getUserLoans', () => {
    it('should return user loans', async () => {
      const mockLoans = [
        { id: 1, userId: 1, bookId: 1, status: 'ACTIVE' },
        { id: 2, userId: 1, bookId: 2, status: 'RETURNED' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => mockLoans
            })
          })
        }
      }));

      const result = await loanService.getUserLoans(1);
      expect(result).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const mockLoans = [
        { id: 1, userId: 1, bookId: 1, status: 'ACTIVE' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                where: () => mockLoans
              })
            })
          })
        }
      }));

      const result = await loanService.getUserLoans(1, 'ACTIVE');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('ACTIVE');
    });
  });

  describe('returnBook', () => {
    it('should return book successfully', async () => {
      // Mock loan fetch
      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [{
                  id: 1,
                  userId: 1,
                  bookId: 1,
                  status: 'ACTIVE'
                }]
              })
            })
          }),
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{
                  id: 1,
                  status: 'RETURNED',
                  returnDate: new Date()
                }]
              })
            })
          })
        }
      }));

      // Mock fetch for book update
      global.fetch = mock(async (url: string) => ({
        ok: true,
        json: async () => ({
          id: 1,
          availableCopies: 1
        })
      } as Response));

      // Mock RabbitMQ channel
      mock.module('../../../src/config/amqp', () => ({
        getChannel: async () => ({
          sendToQueue: async () => true
        })
      }));

      const result = await loanService.returnBook(1);
      expect(result.status).toBe('RETURNED');
      expect(result).toHaveProperty('returnDate');
    });

    it('should throw error for invalid loan', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => []
              })
            })
          })
        }
      }));

      await expect(loanService.returnBook(999))
        .rejects.toThrow('Invalid loan or already returned');
    });
  });

  describe('checkOverdueLoans', () => {
    it('should update overdue loans', async () => {
      const mockOverdueLoans = [
        { id: 1, userId: 1, bookId: 1, status: 'ACTIVE', dueDate: new Date('2023-01-01') }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                where: () => mockOverdueLoans
              })
            })
          }),
          update: () => ({
            set: () => ({
              where: () => ({ success: true })
            })
          })
        }
      }));

      const result = await loanService.checkOverdueLoans();
      expect(result).toHaveLength(1);
    });
  });
});
```

lalu untuk menjalankan testnya kalian bisa menambahkan script pada package.json kalian seperti ini

```json
"scripts": {
  "test": "bun test",
  "test:watch": "bun test --watch",
},
```

atau kalian bisa langsung menjalankan command di terminal

```
bun test
bun test --watch
```

### 4. Review Service

untuk service ini kita akan menginstall dependencies tambahan dari sebelumnya
```json
{
  "name": "borrowing-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "bcrypt": "^5.1.1",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "jsonwebtoken": "^9.0.2",
    "postgres": "latest"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.7",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest"
  }
}
```
lalu install dependencies
```
bun install
```

seperti sebulumnya mari mulai dari `drizzle.config.ts` dan `.env`
- drizzle.config.ts
```ts 
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/models/*',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config
```

- .env
```
DATABASE_URL="url neon db"
JWT_SECRET=randomparanolep
CATALOG_SERVICE_URL=http://localhost:3002
```
jangan lupa masukan databse url neon kalian dan tambahkan port katalog dan amqp

lalu ke ke folder config

- src/config/database.ts
```ts
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString, { 
  max: 1,
  ssl: true
})

export const db = drizzle(client)
```

lalu folder db
- src/db/migrate.ts
```ts
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config()

const runMigration = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  const db = drizzle(sql)

  console.log('Creating schema if not exists...')
  await sql`CREATE SCHEMA IF NOT EXISTS review_service;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

lalu ke middleware

- src/middleware/errorHandler.ts
```ts
// src/middleware/errorHandler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, set }: any) => {
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { error: 'Not Found' }
      case 'VALIDATION':
        set.status = 400
        return { error: 'Validation Error', details: error.message }
      default:
        set.status = 500
        return { error: 'Internal Server Error' }
    }
  })
```

- src/middleware/auth.ts
```ts
// src/middleware/auth.ts
import { verify } from './jwt'

export const authMiddleware = async ({ request, set }: any) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized - No token provided' }
  }

  try {
    const token = authHeader.split(' ')[1]
    const payload = await verify(token)
    return
  } catch (error) {
    set.status = 401
    return { error: 'Invalid token' }
  }
}
```

- src/middleware/jwt.ts
```ts
// src/middleware/jwt.ts
import { verify as jwtVerify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const verify = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwtVerify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
```

lalu folder models
- src/models/schema.ts
```ts
// src/models/schema.ts
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  bookId: integer('book_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: 'review_service'
  }
})
```

folder routes
- src/routes/loanRoutes.ts
```ts
// src/routes/reviewRoutes.ts
import { Elysia, t } from 'elysia'
import { ReviewService } from '../services/reviewService'
import { authMiddleware } from '../middleware/auth'

const reviewService = new ReviewService()

export const reviewRoutes = new Elysia({ prefix: '/api/reviews' })
  .post('/', async ({ body }) => {
    return await reviewService.createReview(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      userId: t.Number(),
      bookId: t.Number(),
      rating: t.Number(),
      comment: t.Optional(t.String())
    })
  })

  .get('/book/:bookId', async ({ params, query }) => {
    const { page = 1, limit = 10 } = query
    return await reviewService.getBookReviews(Number(params.bookId), Number(page), Number(limit))
  }, {
    params: t.Object({
      bookId: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String())
    })
  })

  .get('/user/:userId', async ({ params }) => {
    return await reviewService.getUserReviews(Number(params.userId))
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      userId: t.String()
    })
  })

  .put('/:id', async ({ params, body }) => {
    const { userId, ...updateData } = body
    return await reviewService.updateReview(Number(params.id), userId, updateData)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      userId: t.Number(),
      rating: t.Optional(t.Number()),
      comment: t.Optional(t.String())
    })
  })

  .delete('/:id', async ({ params, body }) => {
    return await reviewService.deleteReview(Number(params.id), body.userId)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      userId: t.Number()
    })
  })
```

folder services
- src/services/loanService.ts
```ts
// src/services/reviewService.ts
import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { reviews } from '../models/schema'

export class ReviewService {
  async createReview(reviewData: any) {
    // Check if user already reviewed this book
    try {
      const existingReview = await db.select()
        .from(reviews)
        .where(eq(reviews.userId, reviewData.userId))
        .where(eq(reviews.bookId, reviewData.bookId))
        .limit(1);
      
      // Check book availability from catalog service
      const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${reviewData.bookId}`)
      
      if (!bookResponse.ok) { 
        // Handle non-200 response (e.g., 404 Book not found)
        const errorMessage = await bookResponse.json();
        throw new Error(errorMessage.message || 'Error fetching book data');
      }
    
      if (existingReview.length) {
        throw new Error('User already reviewed this book');
      }
    
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
    
      const review = await db.insert(reviews)
        .values(reviewData)
        .returning();
    
      await this.updateBookAverageRating(reviewData.bookId);
    
      return review[0];
    } catch (error: any) {
      console.error(error);
      throw new Error('Error creating review: ' + error.message);
    }
  }

  async getBookReviews(bookId: number, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
  
      const [data, total] = await Promise.all([
        db.select()
          .from(reviews)
          .where(eq(reviews.bookId, bookId))
          .limit(limit)
          .offset(offset)
          .orderBy(reviews.createdAt),
        db.select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.bookId, bookId))
          .then(res => Number(res[0].count))
      ]);
  
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      console.error(error);
      throw new Error('Error fetching book reviews: ' + error.message);
    }
  }

  async getUserReviews(userId: number) {
    try {
      return await db.select()
        .from(reviews)
        .where(eq(reviews.userId, userId));
    } catch (error: any) {
      console.error(error);
      throw new Error('Error fetching user reviews: ' + error.message);
    }
  }

  async updateReview(id: number, userId: number, data: any) {
    try {
      const review = await db.select()
        .from(reviews)
        .where(eq(reviews.id, id))
        .limit(1);
  
      if (!review.length || review[0].userId !== userId) {
        throw new Error('Review not found or unauthorized');
      }
  
      if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }
  
      const updatedReview = await db.update(reviews)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(reviews.id, id))
        .returning();
  
      if (data.rating) {
        await this.updateBookAverageRating(review[0].bookId);
      }
  
      return updatedReview[0];
    } catch (error: any) {
      console.error(error);
      throw new Error('Error updating review: ' + error.message);
    }
  }

  async deleteReview(id: number, userId: number) {
    try {
      const review = await db.select()
        .from(reviews)
        .where(eq(reviews.id, id))
        .limit(1);
  
      if (!review.length || review[0].userId !== userId) {
        throw new Error('Review not found or unauthorized');
      }
  
      await db.delete(reviews)
        .where(eq(reviews.id, id));
  
      await this.updateBookAverageRating(review[0].bookId);
  
      return { message: 'Review deleted successfully' };
    } catch (error: any) {
      console.error(error);
      throw new Error('Error deleting review: ' + error.message);
    }
  }

  private async updateBookAverageRating(bookId: number) {
    try {
      const result = await db.select({
        averageRating: sql<number>`AVG(rating)::numeric(2,1)`,
        totalReviews: sql<number>`COUNT(*)`
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));
  
      await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          averageRating: result[0].averageRating,
          totalReviews: result[0].totalReviews
        })
      });
    } catch (error: any) {
      console.error(error);
      throw new Error('Error updating book average rating: ' + error.message);
    }
  }
}
```

- src/index.ts
```ts
// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'
import { reviewRoutes } from './routes/reviewRoutes'
import { errorHandler } from './middleware/errorHandler'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      
      info: {
        title: 'Review Service API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  }))
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .use(errorHandler)
  .use(reviewRoutes)
  .listen(3004)

console.log(`🚀 Review service is running at ${app.server?.hostname}:${app.server?.port}`)
```

jika sudah kalian bisa coba dengan menjalankan terminal berikut
```
bun run db:generate
bun run db:migrate
bun run dev
```

jika berhasil maka kana berjalan di port 3004

untuk setup nya mari buat file tests pada project kalian

```
mkdir tests
```
pertama buat setup.ts untuk database mocknya

```ts
// tests/setup.ts
import { mock } from "bun:test";

// Global mock for bcrypt
mock.module('bcrypt', () => ({
  hash: () => Promise.resolve('hashed_password_123'),
  compare: () => Promise.resolve(true)
}));

// Global mock for database if needed
mock.module('../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: () => []
      })
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => []
        })
      })
    })
  }
}));
```

lalu buat test untuk service

```
mkdir tests/unit/loanService.test.ts
```

seperti sebelumnya masukan code untuk testing service review serperti berikut

```ts
// tests/unit/services/reviewService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ReviewService } from '../../../src/services/reviewService';
import { eq } from 'drizzle-orm';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
    process.env.CATALOG_SERVICE_URL = 'http://localhost:3002';

    // Mock the database with proper chainable queries
    mock.module('../../../src/config/database', () => ({
      db: {
        select: () => {
          const chainableQuery = {
            from: () => chainableQuery,
            where: () => chainableQuery,
            limit: () => [],
            offset: () => chainableQuery,
            orderBy: () => chainableQuery,
            returning: () => [{
              id: 1,
              userId: 1,
              bookId: 1,
              rating: 4,
              comment: 'Test review',
              averageRating: 4.0,
              totalReviews: 1
            }]
          };
          return chainableQuery;
        },
        insert: () => ({
          values: () => ({
            returning: () => [{
              id: 1,
              userId: 1,
              bookId: 1,
              rating: 4,
              comment: 'Test review',
              createdAt: new Date(),
              updatedAt: new Date()
            }]
          })
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => [{
                id: 1,
                userId: 1,
                bookId: 1,
                rating: 5,
                comment: 'Updated review'
              }]
            })
          })
        }),
        delete: () => ({
          where: () => true
        })
      }
    }));

    // Mock fetch global
    global.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ 
        id: 1,
        averageRating: 4.0,
        totalReviews: 1
      })
    } as Response));
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const chainableQuery = {
        from: () => chainableQuery,
        where: () => chainableQuery,
        limit: () => [],
        offset: () => chainableQuery,
        orderBy: () => chainableQuery,
        returning: () => [{
          id: 1,
          userId: 1,
          bookId: 1,
          rating: 4,
          comment: 'Test review'
        }]
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery,
          insert: () => ({
            values: () => ({
              returning: () => [{
                id: 1,
                userId: 1,
                bookId: 1,
                rating: 4,
                comment: 'Test review',
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            })
          })
        }
      }));

      const result = await reviewService.createReview({
        userId: 1,
        bookId: 1,
        rating: 4,
        comment: 'Test review'
      });

      expect(result).toHaveProperty('id');
      expect(result.rating).toBe(4);
    });
  });

  describe('getBookReviews', () => {
    it('should return paginated book reviews', async () => {
      const mockReviews = [
        { id: 1, rating: 4, comment: 'Great!' },
        { id: 2, rating: 5, comment: 'Amazing!' }
      ];

      const chainableQuery = {
        from: () => chainableQuery,
        where: () => chainableQuery,
        limit: () => chainableQuery,
        offset: () => chainableQuery,
        orderBy: () => mockReviews,
        then: (cb: any) => cb([{ count: '2' }])
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery
        }
      }));

      const result = await reviewService.getBookReviews(1);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getUserReviews', () => {
    it('should return user reviews', async () => {
      const mockReviews = [
        { id: 1, userId: 1, rating: 4 },
        { id: 2, userId: 1, rating: 5 }
      ];

      const chainableQuery = {
        from: () => chainableQuery,
        where: () => mockReviews
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery
        }
      }));

      const result = await reviewService.getUserReviews(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateReview', () => {
    it('should update review successfully', async () => {
      const mockReview = {
        id: 1,
        userId: 1,
        bookId: 1,
        rating: 4
      };

      const selectQuery = {
        from: () => selectQuery,
        where: () => selectQuery,
        limit: () => [mockReview]
      };

      const updateQuery = {
        set: () => ({
          where: () => ({
            returning: () => [{
              ...mockReview,
              rating: 5,
              comment: 'Updated review'
            }]
          })
        })
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => selectQuery,
          update: () => updateQuery
        }
      }));

      const result = await reviewService.updateReview(1, 1, {
        rating: 5,
        comment: 'Updated review'
      });

      expect(result.rating).toBe(5);
    });
  });

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      const selectQuery = {
        from: () => selectQuery,
        where: () => selectQuery,
        limit: () => [{
          id: 1,
          userId: 1,
          bookId: 1
        }]
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => selectQuery,
          delete: () => ({
            where: () => true
          })
        }
      }));

      const result = await reviewService.deleteReview(1, 1);
      expect(result.message).toBe('Review deleted successfully');
    });
  });
});
```

lalu untuk menjalankan testnya kalian bisa menambahkan script pada package.json kalian seperti ini

```json
"scripts": {
  "test": "bun test",
  "test:watch": "bun test --watch",
},
```

atau kalian bisa langsung menjalankan command di terminal

```
bun test
bun test --watch
```


### 5. Notification Service

kali ini akan sedikit berbeda dari service2 sebelumnya, dimana kalian akan mengimplementasikan
smtp mailer dan RabitMQ secara bersamaan pada service ini, mari kita mulai

- src/config/amqp.ts
```ts
// src/config/amqp.ts
import amqp from 'amqplib'

export const connectQueue = async () => {
    try {
        const connection = await amqp.connect(process.env.CLOUDAMQP_URL!)
        const channel = await connection.createChannel()
        
        // Declare queues
        await channel.assertQueue('loan.due')
        await channel.assertQueue('book.returned')

        console.log('Connected to CloudAMQP')
        
        return channel
    } catch (error) {
        console.error('Error connecting to CloudAMQP:', error)
        throw error
    }
}
```
- src/config/database.ts
```ts
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Konfigurasi untuk Neon
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  ssl: true, // Wajib untuk Neon DB
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(sql)
```
lalu folder db

- src/config/database.ts
```ts
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Konfigurasi untuk Neon
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  ssl: true, // Wajib untuk Neon DB
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(sql)
```

lalu untuk middleware

- src/middleware/errorHandler.ts
```ts
// src/middleware/errorHandler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, set }: any) => {
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { error: 'Not Found' }
      case 'VALIDATION':
        set.status = 400
        return { error: 'Validation Error', details: error.message }
      default:
        set.status = 500
        return { error: 'Internal Server Error' }
    }
  })
```

- src/middleware/auth.ts
```ts
// src/middleware/auth.ts
import { verify } from './jwt'

export const authMiddleware = async ({ request, set }: any) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized - No token provided' }
  }

  try {
    const token = authHeader.split(' ')[1]
    const payload = await verify(token)
    return
  } catch (error) {
    set.status = 401
    return { error: 'Invalid token' }
  }
}
```

- src/middleware/jwt.ts
```ts
// src/middleware/jwt.ts
import { verify as jwtVerify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const verify = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwtVerify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
```

- src/models/schema.ts
```ts
// src/models/schema.ts
import { pgTable, serial, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'LOAN_DUE', 'BOOK_RETURNED', etc.
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'SENT', 'FAILED'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: 'notification_service'
  }
})
```


- src/queue/consumers.ts
```ts
// src/queue/consumers.ts
import { connectQueue } from '../config/amqp'
import { NotificationService } from '../services/notificationService'

const notificationService = new NotificationService()

export const setupConsumers = async () => {
    try {
        const channel = await connectQueue()

        // Loan due consumer
        channel.consume('loan.due', async (msg) => {
            if (msg) {
                try {
                    const { userId, bookId, dueDate } = JSON.parse(msg.content.toString())
                    await notificationService.handleLoanDueNotification(userId, bookId, dueDate)
                    channel.ack(msg)
                } catch (error) {
                    console.error('Error processing loan.due:', error)
                    channel.nack(msg)
                }
            }
        })

        // Book returned consumer
        channel.consume('book.returned', async (msg) => {
            if (msg) {
                try {
                    const { userId, bookId } = JSON.parse(msg.content.toString())
                    await notificationService.handleBookReturnedNotification(userId, bookId)
                    channel.ack(msg)
                } catch (error) {
                    console.error('Error processing book.returned:', error)
                    channel.nack(msg)
                }
            }
        })

        console.log('RabbitMQ consumers setup completed')
    } catch (error) {
        console.error('Error setting up RabbitMQ consumers:', error)
    }
}
```

- src/routes/notificationRoutes.ts
```ts
// src/routes/notificationRoutes.ts
import { Elysia, t } from 'elysia'
import { NotificationService } from '../services/notificationService'
import { authMiddleware } from '../middleware/auth'

const notificationService = new NotificationService()

export const notificationRoutes = new Elysia({ prefix: '/api/notifications' })
  .get('/user/:userId', async ({ params, query }: any) => {
    const { page = 1, limit = 10 } = query
    return await notificationService.getUserNotifications(
      Number(params.userId),
      Number(page),
      Number(limit)
    )
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      userId: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String())
    })
  })
  .post('/test', async ({ body }: any) => {
    return await notificationService.sendTestNotification(body)
  }, {
    body: t.Object({
      email: t.String(),
      type: t.String({
        enum: ['TEST_EMAIL', 'LOAN_DUE', 'BOOK_RETURNED']
      })
    })
  })
```

- src/services/emailService.ts
```ts
// src/services/emailService.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    })
    return info
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}
```


- src/services/notificationService.ts
```ts
// src/services/notificationService.ts
import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { notifications } from '../models/schema'
import { sendEmail } from './emailServices'
import { emailTemplates } from '../templates/emailTemplates'

export class NotificationService {
  async createNotification(data: any) {
    const notification = await db.insert(notifications)
      .values(data)
      .returning()

    // Get user email from user service
    const userResponse = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${data.userId}`)
    const user = await userResponse.json()

    // Send email
    try {
      await sendEmail(
        user.email,
        `Library Notification - ${data.type}`,
        data.message
      )

      await db.update(notifications)
        .set({ status: 'SENT' })
        .where(eq(notifications.id, notification[0].id))
    } catch (error) {
      await db.update(notifications)
        .set({ status: 'FAILED' })
        .where(eq(notifications.id, notification[0].id))
      throw error
    }

    return notification[0]
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit

    const [data, total] = await Promise.all([
      db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(notifications.createdAt),
      db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .then(res => Number(res[0].count))
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async handleLoanDueNotification(userId: number, bookId: number, dueDate: string) {
    const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${bookId}`)
    const book = await bookResponse.json()
  
    const message = emailTemplates.loanDue(book.title, dueDate)
  
    return await this.createNotification({
      userId,
      type: 'LOAN_DUE',
      message
    })
  }
  
  async handleBookReturnedNotification(userId: number, bookId: number) {
    const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${bookId}`)
    const book = await bookResponse.json()
  
    const message = emailTemplates.bookReturned(book.title)
  
    return await this.createNotification({
      userId,
      type: 'BOOK_RETURNED',
      message
    })
  }

  async sendTestNotification(data: { email: string, type: string }) {
    let subject: string
    let message: string

    switch (data.type) {
      case 'TEST_EMAIL':
        subject = 'Test Notification'
        message = emailTemplates.test()
        break
      case 'LOAN_DUE':
        subject = 'Book Due Reminder - Test'
        message = emailTemplates.loanDue('Test Book', new Date().toISOString())
        break
      case 'BOOK_RETURNED':
        subject = 'Book Returned - Test'
        message = emailTemplates.bookReturned('Test Book')
        break
      default:
        throw new Error('Invalid notification type')
    }

    try {
      const result = await sendEmail(data.email, subject, message)
      return {
        success: true,
        message: 'Test notification sent successfully',
        details: result
      }
    } catch (error: any) {
      console.error('Failed to send test notification:', error)
      throw new Error(`Failed to send test notification: ${error.message}`)
    }
  }
}
```

- notification-service/src/templates/emailTemplates.ts
```ts
// notification-service/src/templates/emailTemplates.ts
export const emailTemplates = {
  loanDue: (bookTitle: string, dueDate: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Book Due Reminder</h2>
      <p>Your book "<strong>${bookTitle}</strong>" is due on ${new Date(dueDate).toLocaleDateString()}.</p>
      <p>Please return it to avoid any late fees.</p>
      <br>
      <p>Thank you for using our library service!</p>
    </div>
  `,

  bookReturned: (bookTitle: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Book Returned Successfully</h2>
      <p>Thank you for returning "<strong>${bookTitle}</strong>".</p>
      <p>We hope you enjoyed reading it!</p>
      <br>
      <p>Feel free to browse our catalog for more books.</p>
    </div>
  `,

  newBooksAvailable: (books: Array<{ title: string, author: string }>) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>New Books Available!</h2>
      <p>Check out our latest additions:</p>
      <ul>
        ${books.map(book => `
          <li><strong>${book.title}</strong> by ${book.author}</li>
        `).join('')}
      </ul>
      <br>
      <p>Visit our library to borrow these books today!</p>
    </div>
  `,

  test: () => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Test Notification</h2>
      <p>This is a test notification from the Digital Library system.</p>
      <p>If you received this email, the notification system is working correctly!</p>
      <br>
      <p>Time sent: ${new Date().toLocaleString()}</p>
    </div>
  `
}
```

- src/index.ts
```ts
// src/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'
import { notificationRoutes } from './routes/norificationRoutes'
import { errorHandler } from './middleware/errorHandler'
import { setupConsumers } from './queue/consumers'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Notification Service API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  }))
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .use(errorHandler)
  .use(notificationRoutes)
  .listen(3005)

// Setup RabbitMQ consumers
setupConsumers()

console.log(`🚀 Notification service is running at ${app.server?.hostname}:${app.server?.port}`)
```

jika sudah kalian bisa coba dengan menjalankan terminal berikut
```
bun run db:generate
bun run db:migrate
bun run dev
```

lalu testingnya untuk kali kita tidak perlu setup langsung membuat service testingnya


- emailService.test.ts
```ts
// tests/unit/services/reviewService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ReviewService } from '../../../src/services/reviewService';
import { eq } from 'drizzle-orm';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
    process.env.CATALOG_SERVICE_URL = 'http://localhost:3002';

    // Mock the database with proper chainable queries
    mock.module('../../../src/config/database', () => ({
      db: {
        select: () => {
          const chainableQuery = {
            from: () => chainableQuery,
            where: () => chainableQuery,
            limit: () => [],
            offset: () => chainableQuery,
            orderBy: () => chainableQuery,
            returning: () => [{
              id: 1,
              userId: 1,
              bookId: 1,
              rating: 4,
              comment: 'Test review',
              averageRating: 4.0,
              totalReviews: 1
            }]
          };
          return chainableQuery;
        },
        insert: () => ({
          values: () => ({
            returning: () => [{
              id: 1,
              userId: 1,
              bookId: 1,
              rating: 4,
              comment: 'Test review',
              createdAt: new Date(),
              updatedAt: new Date()
            }]
          })
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => [{
                id: 1,
                userId: 1,
                bookId: 1,
                rating: 5,
                comment: 'Updated review'
              }]
            })
          })
        }),
        delete: () => ({
          where: () => true
        })
      }
    }));

    // Mock fetch global
    global.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ 
        id: 1,
        averageRating: 4.0,
        totalReviews: 1
      })
    } as Response));
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const chainableQuery = {
        from: () => chainableQuery,
        where: () => chainableQuery,
        limit: () => [],
        offset: () => chainableQuery,
        orderBy: () => chainableQuery,
        returning: () => [{
          id: 1,
          userId: 1,
          bookId: 1,
          rating: 4,
          comment: 'Test review'
        }]
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery,
          insert: () => ({
            values: () => ({
              returning: () => [{
                id: 1,
                userId: 1,
                bookId: 1,
                rating: 4,
                comment: 'Test review',
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            })
          })
        }
      }));

      const result = await reviewService.createReview({
        userId: 1,
        bookId: 1,
        rating: 4,
        comment: 'Test review'
      });

      expect(result).toHaveProperty('id');
      expect(result.rating).toBe(4);
    });
  });

  describe('getBookReviews', () => {
    it('should return paginated book reviews', async () => {
      const mockReviews = [
        { id: 1, rating: 4, comment: 'Great!' },
        { id: 2, rating: 5, comment: 'Amazing!' }
      ];

      const chainableQuery = {
        from: () => chainableQuery,
        where: () => chainableQuery,
        limit: () => chainableQuery,
        offset: () => chainableQuery,
        orderBy: () => mockReviews,
        then: (cb: any) => cb([{ count: '2' }])
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery
        }
      }));

      const result = await reviewService.getBookReviews(1);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getUserReviews', () => {
    it('should return user reviews', async () => {
      const mockReviews = [
        { id: 1, userId: 1, rating: 4 },
        { id: 2, userId: 1, rating: 5 }
      ];

      const chainableQuery = {
        from: () => chainableQuery,
        where: () => mockReviews
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery
        }
      }));

      const result = await reviewService.getUserReviews(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateReview', () => {
    it('should update review successfully', async () => {
      const mockReview = {
        id: 1,
        userId: 1,
        bookId: 1,
        rating: 4
      };

      const selectQuery = {
        from: () => selectQuery,
        where: () => selectQuery,
        limit: () => [mockReview]
      };

      const updateQuery = {
        set: () => ({
          where: () => ({
            returning: () => [{
              ...mockReview,
              rating: 5,
              comment: 'Updated review'
            }]
          })
        })
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => selectQuery,
          update: () => updateQuery
        }
      }));

      const result = await reviewService.updateReview(1, 1, {
        rating: 5,
        comment: 'Updated review'
      });

      expect(result.rating).toBe(5);
    });
  });

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      const selectQuery = {
        from: () => selectQuery,
        where: () => selectQuery,
        limit: () => [{
          id: 1,
          userId: 1,
          bookId: 1
        }]
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => selectQuery,
          delete: () => ({
            where: () => true
          })
        }
      }));

      const result = await reviewService.deleteReview(1, 1);
      expect(result.message).toBe('Review deleted successfully');
    });
  });
});
```
dan ini untuk notification service testingnya

- notificationService.test.ts

```ts
// tests/unit/services/notificationService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NotificationService } from '../../../src/services/notificationService';
import { emailTemplates } from '../../../src/templates/emailTemplates';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    process.env.USER_SERVICE_URL = 'http://localhost:3001';
    process.env.CATALOG_SERVICE_URL = 'http://localhost:3002';

    // Mock email service
    mock.module('../../../src/services/emailServices', () => ({
      sendEmail: async () => ({ messageId: 'test-id' })
    }));
  });

  describe('createNotification', () => {
    it('should create notification and send email successfully', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'TEST',
        message: 'Test message',
        status: 'PENDING'
      };

      // Mock database operations
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [mockNotification]
            })
          }),
          update: () => ({
            set: () => ({
              where: () => Promise.resolve([{ ...mockNotification, status: 'SENT' }])
            })
          })
        }
      }));

      // Mock fetch for user service
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({ email: 'test@example.com' })
      } as Response));

      const result = await notificationService.createNotification({
        userId: 1,
        type: 'TEST',
        message: 'Test message'
      });

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('handleLoanDueNotification', () => {
    it('should create loan due notification', async () => {
      // Mock book service response
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Book' })
      } as Response));

      // Mock createNotification
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'LOAN_DUE',
        message: emailTemplates.loanDue('Test Book', '2024-01-01')
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [mockNotification]
            })
          }),
          update: () => ({
            set: () => ({
              where: () => Promise.resolve([{ ...mockNotification, status: 'SENT' }])
            })
          })
        }
      }));

      const result = await notificationService.handleLoanDueNotification(1, 1, '2024-01-01');
      expect(result.type).toBe('LOAN_DUE');
    });
  });

  describe('handleBookReturnedNotification', () => {
    it('should create book returned notification', async () => {
      // Mock book service response
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Book' })
      } as Response));

      // Mock createNotification
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'BOOK_RETURNED',
        message: emailTemplates.bookReturned('Test Book')
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [mockNotification]
            })
          }),
          update: () => ({
            set: () => ({
              where: () => Promise.resolve([{ ...mockNotification, status: 'SENT' }])
            })
          })
        }
      }));

      const result = await notificationService.handleBookReturnedNotification(1, 1);
      expect(result.type).toBe('BOOK_RETURNED');
    });
  });

  describe('sendTestNotification', () => {
    it('should send test email successfully', async () => {
      const result = await notificationService.sendTestNotification({
        email: 'test@example.com',
        type: 'TEST_EMAIL'
      });

      expect(result.success).toBe(true);
    });

    it('should throw error for invalid notification type', async () => {
      await expect(
        notificationService.sendTestNotification({
          email: 'test@example.com',
          type: 'INVALID_TYPE'
        })
      ).rejects.toThrow('Invalid notification type');
    });
  });
});
```

lalu untuk menjalankan testnya kalian bisa menambahkan script pada package.json kalian seperti ini

```json
"scripts": {
  "test": "bun test",
  "test:watch": "bun test --watch",
},
```

atau kalian bisa langsung menjalankan command di terminal

```
bun test
bun test --watch
```

Untuk part 1 kita akhiri dan mari lanjut ke part 2 untuk pembuatan API Gateway dan setup PM2