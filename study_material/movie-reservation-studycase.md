# Movie reservation Project
pada tahap ini ktia akan bersama2 membuat project untuk study case movie reservation.

![image](https://github.com/user-attachments/assets/a77a59e9-cf58-4ee7-8b67-728be28d5c1e)

pada gambar di atas kalian bisa lihat arsitektur project yang akan kita buat. dalam project ini ber-arsitektur microservice yang terdiri dari 5 service dan 6 schema model table dalam satu database kita dan juga ada tambahan untuk payment fitur.

dan pada case project ini kita akan menggunakan tech bun + elysia untuk framework dan library bawaanya seperti corse, jwt, dll. lalu PM2 untuk manajemen service, nodemailer untuk mengirimkan link pembayaran dan ticketnya ke email user, dan stripe untuk melakukan transaksi dan pembayaran. 

## preparation project
sebelum kita mulai marikita buat schema table dan API yang akan kita buat di setiap servicenya.

### Schema model table

![image](https://github.com/user-attachments/assets/2c2e4594-8eea-4956-8a57-c0fe6923e757)


seperti di gambar kita memiliki 6 schema table 
1. **users**
untuk table user ini memiliki atribut :
    - id (uuid)
    - email (varchar)
    - password (varchar)
    - phone (varchar)
    - role (varchar)
    - created_at (timestamp)
    - updated_at (timestamp)

2. **theaters**
untuk table theaters ini memiliki atribut :
    - id (uuid)
    - name (varchar)
    - address (varchar)
    - city (varchar)
    - total_screens (int)
    - created_at (timestamp)
    - updated_at (timestamp)

3. **seats**
untuk table seats ini memiliki atribut :
    - id (uuid)
    - movie_schedule_id (varchar)
    - seat_code (varchar)
    - status (varchar)
    - created_at (timestamp)
    - updated_at (timestamp)

4. **movies**
untuk table movies ini memiliki atribut :
    - id (uuid)
    - title (varchar)
    - description (varchar)
    - genre (varchar)
    - duration (int)
    - rating (int)
    - created_at (timestamp)
    - updated_at (timestamp)

5. **movie_schedules**
untuk table movie_schedules ini memiliki atribut :
    - id (uuid)
    - movie_id (uuid)
    - theater_id (uuid)
    - screen_number (numeric)
    - duration (int)
    - start_time (timestamp)
    - end_time (timestamp)

6. **tickets**
untuk table tickets ini memiliki atribut :
    - id (uuid)
    - movie_id (uuid)
    - theater_id (uuid)
    - screen_number (numeric)
    - duration (int)
    - start_time (timestamp)
    - end_time (timestamp)

### Fitur service

kita akan menentukan beberapa service API yang akan di buat.

1. **Users Service**
untuk Users Service ini memiliki fitur :
    - POST / register user
    - POST / login user
    - GET / get user by Id
    - PUT / edit user by id
    - delete / delete user by id

2. **Theater Service**
untuk Theater Service ini memiliki fitur :
    - GET / get all theater
    - GET / get theater by Id
    - POST / create theater
    - PUT / edit theater by id
    - delete / delete theater by id

3. **Reservation Service**
untuk Reservation Service ini memiliki fitur :
    - GET / get all reservation seat
    - GET / get reservation seat by Id
    - GET / get reservation seat by theaterId
    - POST / create reservation seat
    - PUT / edit reservation seat by id
    - PUT / update seat status by id
    - delete / delete reservation seat by id

4. **Movie Service**
untuk Movie Service ini memiliki fitur :
- Movies API
    - GET / get all movie
    - GET / get movie by Id
    - POST / create movie
    - PUT / theater movie by id
    - delete / theater movie by id

- Movies_schedules API
    - GET / get all movies_schedule
    - GET / get movie_schedule by Id
    - GET / get movie_schedule by movieId
    - GET / get movie_schedule by date
    - GET / get movie_schedule by theaterId
    - POST / create movie_schedule
    - PUT / update movie_schedule by id
    - delete / delete movie_schedule by id

5. **Tickets Service**
untuk Movie Service ini memiliki fitur :
- Tickets API
    - GET / get own user ticket
    - GET / get ticket by userId
    - GET / get ticket by scheduleId
    - POST / create ticket
    - POST / order ticket
    - PUT / theater movie by id
    - delete / theater movie by id

kita sudah menentukan fitur API yang akan di buat untuk setiap servicenya agar mempermudah pembuatan. mari kita lanjut ke setup project

## Setup project
seperti biasa buat folder project kalian terlebih dahulu kemudian buat structure foldernya seperti ini

```
movie-reservation/
├── .env
├── .env.example
├── .gitignore
├── ecosystem.config.js
├── package.json
├── README.md
│
├── services/
│   ├── users-service/
│   ├── theaters-service/
│   ├── reservations-service/
│   ├── movies-service/
│   └── tickets-service/
```

untuk code `package.json`

```json
{
  "dependencies": {
    "dotenv": "latest",
    "pm2": "latest"
  },
  "scripts": {
    "install-all": "scripts\\install-dependencies.bat",
    "install-all-unix": "./scripts/install-dependencies.sh",
    "migrate": "./scripts/migrate-all.bat",
    "migrate-all-unix": "./scripts/migrate-all.sh",
    "start": "scripts/start-services.bat",
    "start-all-unix": "./scripts/start-services.sh",
    "stop": "pm2 stop all",
    "restart": "pm2 restart all",
    "status": "pm2 status",
    "logs": "pm2 logs",
    "dev": "npm run migrate && npm run start"
  }
}
```


untuk `ecosystem.config.js` code ini digunakan untuk mengatur ekosistem PM2 nantinya pada semua service project kita

```js
// ecosystem.config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apps: [
    {
      name: "users-service",
      script: "./services/users-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_USER,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "theaters-service",
      script: "./services/theaters-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_THEATERS,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "reservations-service",
      script: "./services/reservations-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_RESERVATIONS,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        THEATER_SERVICE_URL: process.env.THEATERS_SERVICE_URL,
        // CLOUDAMQP_URL: process.env.CLOUDAMQP_URL
      }
    },
    {
      name: "movie-service",
      script: "./services/movie-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_MOVIE,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        THEATER_SERVICE_URL: process.env.THEATERS_SERVICE_URL,
      }
    },
    {
      name: "tickets-service",
      script: "./services/tickets-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_TICKETS,
        USERS_SERVICE_URL: process.env.USERS_SERVICE_URL,
        SCHEDULE_SERVICE_URL: process.env.SCHEDULE_SERVICE_URL,
        RESERVATIONS_SERVICE_URL: process.env.RESERVATIONS_SERVICE_URL,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CLOUDAMQP_URL: process.env.CLOUDAMQP_URL,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        SUCCESS_URL: process.env.SUCCESS_URL,
        CANCEL_URL: process.env.CANCEL_URL,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM,
        
      }
    }
  ]
}
```

jika sudah mari kita mulai untuk masuk ke pebuatan service


## 1. Users Service
pada tahap ini kita akan membuat users service terdahulu.

buat project elysia terlebih dahulu
```
bun create elysia "nama service"
```

berikut untuk strucktur user service
```
├── user-service/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   ├── client.ts
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── sanitize.ts
│   │   │   ├── routes/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── user.route.ts
│   │   │   ├── services/
│   │   │   │   └── user.services.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
```

setting `package.json`  dahulu
```json
{
  "name": "users-service",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "@neondatabase/serverless": "^0.10.4",
    "@types/bcryptjs": "^2.4.6",
    "bcrypt": "^5.1.1",
    "bcryptjs": "^2.4.3",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "postgres": "latest",
    "users-service": "."
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest"
  },
  "module": "src/index.js"
}
```

lalu install package yang sudah di daftar di `package.json`

```
bun install
```

lalu kita setting drizzle terlebih dahulu 
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/db/schema.ts',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true
} satisfies Config
```

llalu buat file `.env` untuk menaruh variable penting seperti url database kalain
```
DATABASE_URL=URL_db
JWT_SECRET=randomparanolep
PORT=3001
```

setelah sudah setting config yang lain mari kita masuk ke pembuatan schema

ini code untuk `client.ts`, file ini untuk define db kita dengan drizzle
```ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

lalu kita buat file untuk migrasi schema kita nanti ke dalam database

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
  await sql`CREATE SCHEMA IF NOT EXISTS users;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

jika sudah pengaturan berikut mari kitake pembuatan schema di `schema.ts`

```ts
// src/db/schema.ts
import { pgTable, serial, varchar, timestamp, uuid, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

lalu kalian bisa jalankan ini untuk generate dan migrate table ke database kalian

```
bun db:generate
// atau
drizzle-kit generate

// untuk ngepush schema kalian ke dalam database
bun db:migrate
bun db:push
```

lalu mari kita buat middlewarenya. pertama kita mulai dengan `authMiddleware.ts`

```ts
// src/middleware/auth.ts
export const authMiddleware = async ({ jwt, set, cookie }: any) => {
  const authToken = cookie?.auth?.value; // Pastikan cookie auth tersedia
  if (!authToken) {
    set.status = 401;
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Verifikasi token JWT
    const payload = await jwt.verify(authToken);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { error: 'Unauthorized: Invalid token' };
    }

    // Return user data agar bisa digunakan di route lain
    return 
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    set.status = 401;
    return { error: 'Unauthorized: Token expired or invalid' };
  }
}
```

lalu ke `errorHandler.ts`

```ts
import { Elysia } from 'elysia';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Resource not found' };
      default:
        set.status = 500;
        return { error: 'Internal server error' };
    }
  });
```

yang terakhir ke sanitize.ts
```ts
export const sanitizeUser = (user: any) => {
  if(!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};
```

setelah middleware selesai mari kita ke bagian service di `user.service.ts`

```ts
import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import type { User } from '../db/schema';
import { hash, compare } from 'bcrypt'
import { sanitizeUser } from '../middleware/sanitize';


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

  async getUserById(id: string): Promise<User> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return sanitizeUser(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any) {
    try {
      if (userData.password) {
          userData.password = await hash(userData.password, 10);
      }

      const updatedUser = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser.length) {
        console.warn(`User not found with ID: ${id}`);
        throw new Error('User not found');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw new Error('Failed to update user');
    }
  }

}
```
ini adalah service yang akan kita gunakan di route kita. setelah kita selesai dengan service kita pergi ke route

untuk route `auth.ts`

```ts
import { Elysia, t } from 'elysia';
import { UserService } from '../services/user.services';
import { jwt } from '@elysiajs/jwt'

const userService = new UserService()

export const authRoutes = new Elysia({ prefix: '/auth' })
  

  .post('/register', async ({ body }: any) => {
      return await userService.createUser(body)
    }, {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
        phone: t.String(),
      })
    })
    
    // @ts-ignore
    .post('/login', async ({ body, cookie: { auth }, jwt }) => {
      const user = await userService.loginUser(body.email, body.password)
      const jwtData = { 
        userId: user.id, 
        email: user.email, 
        phone: user.phone
      } as any;
      auth.set({
        value: await jwt.sign(jwtData),
        httpOnly: true,
        maxAge: 7 * 86400,
        secure: true,  // Gunakan HTTPS di production
        sameSite: 'lax', // Harus None jika frontend dan backend berbeda domain
        path: '/',
      })
      return auth.value
    }, {
      body: t.Object({
        email: t.String(),
        password: t.String()
      })
    })
```

lalu ke route `user.route.ts`

```ts
import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { UserService } from '../services/user.services';
import jwt from '@elysiajs/jwt';

const userService = new UserService()

export const userRoutes = new Elysia({ prefix: '/api/users' })
  
  // @ts-ignore
  .get('/:id', async ({ params, error }) => {
    // console.log("Received ID:", params.id);
    const user = await userService.getUserById(params.id);

    if (!user) {
      return error(404, { message: 'User not found' });
    }

    return user;
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })
  
  .put('/:id', async ({ params, body }: any) => {
    return await userService.updateUser((params.id), body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      email: t.Optional(t.String({ format: 'email' })),
      password: t.Optional(t.String()),
      phone: t.Optional(t.String())
    })
  })

  .get('/profile', async ({ jwt, set, cookie: { auth } }: any) => {
    const profile = await jwt.verify(auth.value)

    if (!profile) {
        set.status = 401
        return 'Unauthorized'
    }

    return  { message: 'You are authenticated!', profile } 
  },{
    beforeHandle: [authMiddleware],
  })
```

lalu yang terakhir file `index.ts` kita
```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user.route';
import { errorHandler } from './middleware/errorHandler';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(cors({ credentials: true, origin: 'http://localhost', }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      refresh: {
        maxAge: 7 * 86400,
        httpOnly: true
      },
    })
  )
  .use(errorHandler)
  .use(swagger({ path: '/docs' }))
  .use(authRoutes)
  .use(userRoutes)
  
  .listen(process.env.PORT || 3001);

console.log(`🦊 Users service running at ${app.server?.hostname}:${app.server?.port}`);
```

lalu kita bisa jalankan dengan `bun dev` lalu ke `localhost:3001` untuk buka documentasinya di `localhost:3001/docs`.

untuk settingan auth kita, kita taruh ke dalam cookie.

## 2. Theater Service
pada tahap ini kita akan membuat theater service.

untuk codenya beberapa ada yang sama settingannya jadi tidak kami tunjukan kembali, tetapi structurenya harus sama seperti yang akan kami perlihatkan

buat project elysia terlebih dahulu
```
bun create elysia "nama service"
```

berikut untuk strucktur theater service
```
├── theaters-service/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   ├── client.ts
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   ├── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   └── theater.route.ts
│   │   │   ├── services/
│   │   │   │   └── theater.services.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
```

setting `package.json`  dahulu
```json
{
  "name": "theaters-service",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "@neondatabase/serverless": "^0.10.4",
    "@types/bcryptjs": "^2.4.6",
    "bcrypt": "^5.1.1",
    "bcryptjs": "^2.4.3",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "postgres": "latest",
    "users-service": "."
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest"
  },
  "module": "src/index.js"
}
```

lalu install package yang sudah di daftar di `package.json`

```
bun install
```

lalu kita setting drizzle terlebih dahulu 
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/db/schema.ts',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true
} satisfies Config
```

llalu buat file `.env` untuk menaruh variable penting seperti url database kalain
```
DATABASE_URL=URL_db
JWT_SECRET=randomparanolep
PORT=3002
```

setelah sudah setting config yang lain mari kita masuk ke pembuatan schema

ini code untuk `client.ts`, file ini untuk define db kita dengan drizzle
```ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

lalu kita buat file untuk migrasi schema kita nanti ke dalam database

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
  await sql`CREATE SCHEMA IF NOT EXISTS theaters;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

jika sudah pengaturan berikut mari kitake pembuatan schema di `schema.ts`

```ts
import { pgTable, varchar, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const theaters = pgTable('theaters', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  totalScreens: integer('total_screens').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Theaters = typeof theaters.$inferSelect;
```

lalu kalian bisa jalankan ini untuk generate dan migrate table ke database kalian

```
bun db:generate
// atau
drizzle-kit generate

// untuk ngepush schema kalian ke dalam database
bun db:migrate
bun db:push
```

lalu mari kita buat middlewarenya. pertama kita mulai dengan `authMiddleware.ts`

```ts
// src/middleware/authMiddleware.ts
export const authMiddleware = async ({ jwt, set, cookie }: any) => {
  const authToken = cookie?.auth?.value; // Pastikan cookie auth tersedia
  if (!authToken) {
    set.status = 401;
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Verifikasi token JWT
    const payload = await jwt.verify(authToken);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { error: 'Unauthorized: Invalid token' };
    }

    // Return user data agar bisa digunakan di route lain
    return 
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    set.status = 401;
    return { error: 'Unauthorized: Token expired or invalid' };
  }
}
```

lalu ke `errorHandler.ts`

```ts
import { Elysia } from 'elysia';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Resource not found' };
      default:
        set.status = 500;
        return { error: 'Internal server error' };
    }
  });
```

setelah middleware selesai mari kita ke bagian service di `theaters.service.ts`

```ts
import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { theaters, Theaters } from '../db/schema';

export class TheatersService {

  async getAllTheaters(): Promise<Theaters[]> {
    try {
      const theater = await db.select().from(theaters);
      return theater;
    } catch (error) { 
      console.error('Error in getAllTheaters:', error);
      throw error;
    }
  }

  async getTheaterById(id: string): Promise<Theaters> {
    try {
      const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
      return theater;
    } catch (error) {
      console.error('Error in getTheaterById:', error);
      throw error;
    }
  }

  async createTheater(theaterData: any) {
    try {
      const theater = await db.insert(theaters).values(theaterData).returning();
      return theater;
    } catch (error) {
      console.error('Error in createTheater:', error);
      throw error;
    }
  }

  async updateTheater(id: string, theaterData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedTheater] = await db.update(theaters)
        .set(theaterData)
        .where(eq(theaters.id, id))
        .returning();

      if (!updatedTheater) {
        console.warn(`Theater not found with ID: ${id}`);
        throw new Error('Failed to update theater');
      }

      return updatedTheater; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateTheater:', error);
      throw error;
    }
}

  async deleteTheater(id: string) {
    try {
      const [deletedTheater] = await db.delete(theaters).where(eq(theaters.id, id)).returning();
      if (!deletedTheater) {
        console.warn(`Theater not found with ID: ${id}`);
        throw new Error('Theater not found');
      }
      return deletedTheater;
    } catch (error) {
      console.error('Error in deleteTheater:', error);
      throw error;
    }
  }

}
```
ini adalah service yang akan kita gunakan di route kita. setelah kita selesai dengan service kita pergi ke route

lalu ke route `theaters.route.ts`

```ts
import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { TheatersService } from '../services/theaters.services';
import jwt from '@elysiajs/jwt';

const theatersService = new TheatersService()

export const theatersRoutes = new Elysia({ prefix: '/api/theaters' })
  .get('/', async ( ) => {
    const theater = await theatersService.getAllTheaters();
    return {Theaters: theater};
  })

  .get('/:id', async ({ params, set, query }: any) => {
    const { screenNumber } = query
    const theater = await theatersService.getTheaterById(params.id);

    if (!theater) {
      throw new Error("NOT_FOUND");
    }

    if (screenNumber >= theater.totalScreens){
      set.status = 400
      throw new Error('Screen number out of range');
    }

    return theater;
  }, {
    params: t.Object({
      id: t.String(),  // t.Number() lebih baik jika id harus angka
    }),
    query: t.Object({
      screenNumber: t.Optional(t.Number()), // ✅ Now in query instead of params
    })
  })
  
  .post('/', async ({ body }: any) => {
    return await theatersService.createTheater(body)
  }, {
    body: t.Object({
      name: t.String(),
      address: t.String(),
      city: t.String(),
      totalScreens: t.Number(),
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await theatersService.updateTheater((params.id), body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
    body: t.Partial(t.Object({  // Gunakan Partial untuk memperbolehkan update sebagian
      name: t.String(),
      address: t.String(),
      city: t.String(),
      totalScreens: t.Number(),
    }))
  })

  .delete('/:id', async ({ params }: any) => {
    const theater = await theatersService.deleteTheater(params.id);
    return { message: 'Theater deleted successfully', theater };
  },{
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
  })

  .get('/profile', async ({ jwt, set, cookie: { auth } }: any) => {
    const profile = await jwt.verify(auth.value)

    if (!profile) {
        set.status = 401
        return 'Unauthorized'
    }

    return  { message: 'You are authenticated!', profile } 
  })

```

lalu yang terakhir file `index.ts` kita
```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { theatersRoutes } from './routes/theaters.route';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      exp: "1h",
    })
  )
  .use(cors())

  .use(theatersRoutes)
  .use(errorHandler)
  
  
  .listen(process.env.PORT || 3002);

console.log(`🦊 Theaters service running at ${app.server?.hostname}:${app.server?.port}`);
```

lalu kita bisa jalankan dengan `bun dev` lalu ke `localhost:3002` untuk buka documentasinya di `localhost:3002/docs`.

## 3. Reservations Service
pada tahap ini kita akan membuat Reservations service.

untuk codenya beberapa ada yang sama settingannya jadi tidak kami tunjukan kembali, tetapi structurenya harus sama seperti yang akan kami perlihatkan

buat project elysia terlebih dahulu
```
bun create elysia "nama service"
```

berikut untuk strucktur reservation service
```
├── reservations-service/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   ├── client.ts
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   ├── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   └── reservations.route.ts
│   │   │   ├── services/
│   │   │   │   └── reservations.services.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
```

setting `package.json`  dahulu
```json
{
  "name": "reservations-service",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "@neondatabase/serverless": "^0.10.4",
    "@types/bcryptjs": "^2.4.6",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "postgres": "latest"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest"
  },
  "module": "src/index.js"
}
```

lalu install package yang sudah di daftar di `package.json`

```
bun install
```

lalu kita setting drizzle terlebih dahulu 
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/db/schema.ts',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true
} satisfies Config
```

llalu buat file `.env` untuk menaruh variable penting seperti url database kalain
```
DATABASE_URL=URL_db
JWT_SECRET=randomparanolep
PORT=3003
THEATER_SERVICE_URL=http://localhost:3002
```

setelah sudah setting config yang lain mari kita masuk ke pembuatan schema

ini code untuk `client.ts`, file ini untuk define db kita dengan drizzle
```ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

lalu kita buat file untuk migrasi schema kita nanti ke dalam database

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
  await sql`CREATE SCHEMA IF NOT EXISTS Seats;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

jika sudah pengaturan berikut mari kitake pembuatan schema di `schema.ts`

```ts
import { pgTable, varchar, timestamp, uuid, integer, unique } from 'drizzle-orm/pg-core';

export const seats  = pgTable('seats', {
  id: uuid('id').defaultRandom().primaryKey(),
  movieScheduleId: varchar('movieScheduleId').notNull(),
  seatCode: varchar('seat_code', { length: 3 }).notNull(),  // Hanya A1-G15 yang valid
  status: varchar().default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    uniqueSeat: unique().on(table.movieScheduleId, table.seatCode) // ✅ UNIQUE constraint
  };
});

export type Seats  = typeof seats .$inferSelect;
```

lalu kalian bisa jalankan ini untuk generate dan migrate table ke database kalian

```
bun db:generate
// atau
drizzle-kit generate

// untuk ngepush schema kalian ke dalam database
bun db:migrate
bun db:push
```

lalu mari kita buat middlewarenya. pertama kita mulai dengan `authMiddleware.ts`

```ts
// src/middleware/authMiddleware.ts
export const authMiddleware = async ({ jwt, set, cookie }: any) => {
  const authToken = cookie?.auth?.value; // Pastikan cookie auth tersedia
  if (!authToken) {
    set.status = 401;
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Verifikasi token JWT
    const payload = await jwt.verify(authToken);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { error: 'Unauthorized: Invalid token' };
    }

    // Return user data agar bisa digunakan di route lain
    return 
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    set.status = 401;
    return { error: 'Unauthorized: Token expired or invalid' };
  }
}
```

lalu ke `errorHandler.ts`

```ts
import { Elysia } from 'elysia';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Resource not found' };
      default:
        set.status = 500;
        return { error: 'Internal server error' };
    }
  });
```

setelah middleware selesai mari kita ke bagian service di `reservations.service.ts`

```ts
import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { seats, Seats } from '../db/schema';

function isValidSeatCode(seatCode: string): boolean {
  return /^[A-G](1[0-5]|[1-9])$/.test(seatCode);
}

export class ReservationsService {
  async getSeatById(id: string): Promise<Seats> {
    try {
      const [seat] = await db.select().from(seats).where(eq(seats.id, id));
      return seat;
    } catch (error) {
      console.error('Error in getSeatById:', error);
      throw error;
    }
  }

  async getSeatByTheaterId(id: string): Promise<Seats[]> {
    try {
      const seat = await db.select().from(seats).where(eq(seats.movieScheduleId, id));
      return seat;
    } catch (error) {
      console.error('Error in getSeatById:', error);
      throw error;
    }
  }

  async getAllSeats(): Promise<Seats[]> {
    try {
      const seat = await db.select().from(seats);
      return seat;
    } catch (error) {
      console.error('Error in getAllSeats:', error);
      throw error;
    }
  }

  async createSeat(seatData: any) {
    try {
      if (!isValidSeatCode(seatData.seatCode)) {
        throw new Error('Seat code only from A1 - G15');
      }
      const seat = await db.insert(seats).values(seatData).returning();
      return seat;
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('Seat with this seatCode already exists for this screenNumber');
    }
    console.error('Error in createSeat:', error);
    throw error;
    }
  }

  async updateSeat(id: string, seatData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {

      if (!isValidSeatCode(seatData.seatCode)) {
        throw new Error('Seat code only from A1 - G15');
      }
      const [updatedSeat] = await db.update(seats)
        .set(seatData)
        .where(eq(seats.id, id))
        .returning();

      if (!updatedSeat) {
        console.warn(`Seat not found with ID: ${id}`);
        throw new Error('Failed to update seat');
      }

      return updatedSeat; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateSeat:', error);
      throw error;
    }
  }

  async updateSeatStatus(id: string) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {

      const [updatedSeat] = await db.update(seats)
        .set({ status: 'booked' })
        .where(eq(seats.id, id))
        .returning();

      if (!updatedSeat) {
        console.warn(`Seat not found with ID: ${id}`);
        throw new Error('Failed to update seat');
      }

      return updatedSeat.status; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateSeat:', error);
      throw error;
    }
  }

  async deleteSeat(id: string) {
    try {
      const [deletedSeat] = await db.delete(seats).where(eq(seats.id, id)).returning();
      if (!deletedSeat) {
        console.warn(`Seat not found with ID: ${id}`);
        throw new Error('Seat not found');
      }
      return deletedSeat;
    } catch (error) {
      console.error('Error in deleteSeat:', error);
      throw error;
    }
  }
}
```
ini adalah service yang akan kita gunakan di route kita. setelah kita selesai dengan service kita pergi ke route

lalu ke route `reservations.route.ts`

```ts
import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { ReservationsService } from '../services/reservations.services';
import jwt from '@elysiajs/jwt';

const reservationsService = new ReservationsService()

export const reservationsRoutes = new Elysia({ prefix: '/api/reservations' })

  .get('/', async ( ) => {
    const seats = await reservationsService.getAllSeats();
    return {Seats: seats};
  })

  .get('/:id', async ({ params, error }) => {
    const seats = await reservationsService.getSeatById(params.id);
    if (!seats) {
      return error(404, { message: 'Reservation Seat not found' });
    }
    return seats;
  }, {
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .get('/theater/:theaterId', async ({ params }: any) => {
    const seats = await reservationsService.getSeatByTheaterId(params.theaterId);
    if (!seats) {
      throw new Error("NOT_FOUND");
    }
    return {Seats: seats};
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      theaterId: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .post('/', async ({ body }: any) => {
    return await reservationsService.createSeat(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      movieScheduleId: t.String(),
      seatCode: t.String(),
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await reservationsService.updateSeat(params.id, body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
    body: t.Partial(t.Object({
      theaterId: t.String(),
      screenNumber: t.Number(),
      seatCode: t.String({ pattern: "^[A-G](1[0-5]|[1-9])$" }),  // Validasi dengan Regex,
      status: t.String(),
    }))
  })

  .put('/updateStatus/:id', async ({ params }: any) => {
    const seatStatus = await reservationsService.updateSeatStatus(params.id)
    return {msg: "now seat is " + seatStatus}
  }, {
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .delete('/:id', async ({ params }: any) => {
    return await reservationsService.deleteSeat(params.id)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })
```

lalu yang terakhir file `index.ts` kita
```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { reservationsRoutes } from './routes/reservations.route';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      exp: "1h",
    })
  )
  .use(cors({
    origin: "http://localhost:3005", // Replace with your frontend URL
    credentials: true, // Allow sending cookies
  }))

  .use(reservationsRoutes)
  .use(errorHandler)
  .listen(process.env.PORT || 3003);

console.log(`🦊 Seat Reservastion service running at ${app.server?.hostname}:${app.server?.port}`);
```

lalu kita bisa jalankan dengan `bun dev` lalu ke `localhost:3003` untuk buka documentasinya di `localhost:3003/docs`.

## 4. Movie Service
pada tahap ini kita akan membuat Movie service.

untuk codenya beberapa ada yang sama settingannya jadi tidak kami tunjukan kembali, tetapi structurenya harus sama seperti yang akan kami perlihatkan

buat project elysia terlebih dahulu
```
bun create elysia "nama service"
```

berikut untuk strucktur movie service
```
├── reservations-service/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   ├── client.ts
│   │   │   │   └── migrate.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   ├── movie.route.ts
│   │   │   │   └── schedule.route.ts
│   │   │   ├── services/
│   │   │   │   ├── movie.services.ts
│   │   │   │   └── schedule.services.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
```

setting `package.json`  dahulu
```json
{
  "name": "sections-service",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "@neondatabase/serverless": "^0.10.4",
    "@types/bcryptjs": "^2.4.6",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "postgres": "latest"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest"
  },
  "module": "src/index.js"
}
```

lalu install package yang sudah di daftar di `package.json`

```
bun install
```

lalu kita setting drizzle terlebih dahulu 
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/db/schema.ts',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true
} satisfies Config
```

llalu buat file `.env` untuk menaruh variable penting seperti url database kalain
```
DATABASE_URL=URL_db
JWT_SECRET=randomparanolep
PORT=3004
THEATER_SERVICE_URL=http://localhost:3002
```

setelah sudah setting config yang lain mari kita masuk ke pembuatan schema

ini code untuk `client.ts`, file ini untuk define db kita dengan drizzle
```ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

lalu kita buat file untuk migrasi schema kita nanti ke dalam database

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
  await sql`CREATE SCHEMA IF NOT EXISTS Movie;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

jika sudah pengaturan berikut mari kitake pembuatan schema di `schema.ts`

```ts
import { pgTable, varchar, timestamp, uuid, numeric, integer } from 'drizzle-orm/pg-core';


export const movies = pgTable('movies', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 500 }),
  genre: varchar('genre', { length: 255 }).array(),
  duration: numeric('duration'), // in minutes
  rating: integer('rating').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const movieSchedules = pgTable('movie_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  movieId: uuid('movieId').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  theaterId: varchar('theaterId').notNull(),
  screenNumber: numeric('screenNumber').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
});


export type Movies  = typeof movies .$inferSelect;
export type MovieSchedules  = typeof movieSchedules .$inferSelect;
```

lalu kalian bisa jalankan ini untuk generate dan migrate table ke database kalian

```
bun db:generate
// atau
drizzle-kit generate

// untuk ngepush schema kalian ke dalam database
bun db:migrate
bun db:push
```

lalu mari kita buat middlewarenya. pertama kita mulai dengan `authMiddleware.ts`

```ts
// src/middleware/authMiddleware.ts
export const authMiddleware = async ({ jwt, set, cookie }: any) => {
  const authToken = cookie?.auth?.value; // Pastikan cookie auth tersedia
  if (!authToken) {
    set.status = 401;
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Verifikasi token JWT
    const payload = await jwt.verify(authToken);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { error: 'Unauthorized: Invalid token' };
    }

    // Return user data agar bisa digunakan di route lain
    return 
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    set.status = 401;
    return { error: 'Unauthorized: Token expired or invalid' };
  }
}
```

lalu ke `errorHandler.ts`

```ts
import { Elysia } from 'elysia';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Resource not found' };
      default:
        set.status = 500;
        return { error: 'Internal server error' };
    }
  });
```

setelah middleware selesai mari kita ke bagian service di `movie.service.ts`

```ts
import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { movies, Movies } from '../db/schema';


 export class MoviesServices {
  async getMovies(): Promise<Movies[]> {
    try {
      const moviesList = await db.select().from(movies);
      return moviesList;
    } catch (error) {
      console.error('Error in getMovies:', error);
      throw error;
    }
  }

  async getMovieById(id: string): Promise<Movies> {
    try {
      const [movie] = await db.select().from(movies).where(eq(movies.id, id));
      return movie;
    } catch (error) {
      console.error('Error in getMovieById:', error);
      throw error;
    }
  }

  async createMovie(movieData: any) {
    try {
      const [movie] = await db.insert(movies).values(movieData).returning();
      return movie;
    } catch (error) {
      console.error('Error in createMovie:', error);
      throw error;
    }
  }

  async updateMovie(id: string, movieData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedMovie] = await db.update(movies)
        .set(movieData)
        .where(eq(movies.id, id))
        .returning(); // Mengembalikan data yang diperbarui 

      if (!updatedMovie) {
        throw new Error('Movie not found');
      }

      return updatedMovie; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateMovie:', error);
      throw error;
    }
  }

  async deleteMovie(id: string) {
    try {
      const [deletedMovie] = await db.delete(movies).where(eq(movies.id, id)).returning();
      if (!deletedMovie) {
        throw new Error('Movie not found');
      }
      return deletedMovie;
    } catch (error) {
      console.error('Error in deleteMovie:', error);
      throw error;
    }
  }

}
```

code `schedule.service.ts`

```ts
import { db } from '../db/client';
import { eq, sql } from 'drizzle-orm';
import { movieSchedules, MovieSchedules, movies } from '../db/schema';

export class ScheduleServices {

  async getMovieSchedulesById(id: string): Promise<any> {
    try {
      
      const [movieSchedule] = await db.select().from(movieSchedules).leftJoin(movies, eq(movieSchedules.movieId, movies.id))
      .where(eq(movieSchedules.id, id));
      
      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieSchedulesByMovieId:', error);
      throw error;
    }
  }
  async getMovieSchedulesByMovieId(movieId: string): Promise<MovieSchedules[]> {
    try {
      const movieSchedule = await db.select().from(movieSchedules).where(eq(movieSchedules.movieId, movieId));
      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieSchedulesByMovieId:', error);
      throw error;
    }
  }

  async createMovieSchedule(movieScheduleData: MovieSchedules): Promise<MovieSchedules> {
    try {

      const [movie] = await db.select().from(movies).where(eq(movies.id, movieScheduleData.movieId));
      if (!movie) {
        throw new Error('Movie not found');
      }

      const theaterResponse = await fetch(`${process.env.THEATER_SERVICE_URL}/${movieScheduleData.theaterId}`);
      if (!theaterResponse.ok) {
        return Promise.reject(theaterResponse);
      }
    
      const theaterData = await theaterResponse.json().catch(() => null);

      if (theaterData.totalScreens < movieScheduleData.screenNumber) {
        throw new Error('Theres no screen at that number in this theater');
      }
      
      const [movieSchedule] = await db.insert(movieSchedules).values(movieScheduleData).returning();
      
      return {...movieSchedule};
    } catch (error) {
      console.error('Error in createMovieSchedule:', error);
      throw error;
    }
  }

  async deleteMovieSchedule(id: string) {
    try {
      const [deletedMovieSchedule] = await db.delete(movieSchedules).where(eq(movieSchedules.id, id)).returning();
      if (!deletedMovieSchedule) {
        console.warn(`Movie Schedule not found with ID: ${id}`);
        throw new Error('Movie Schedule not found');
      }
      return deletedMovieSchedule;
    } catch (error) {
      console.error('Error in deleteMovieSchedule:', error);
      throw error;
    }
  } 

  async updateMovieSchedule(id: string, movieScheduleData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedMovieSchedule] = await db.update(movieSchedules)
        .set(movieScheduleData)
        .where(eq(movieSchedules.id, id))
        .returning();
  
      if (!updatedMovieSchedule) {
        console.warn(`Movie Schedule not found with ID: ${id}`);
        throw new Error('Failed to update movie schedule');
      }
  
      return updatedMovieSchedule; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateMovieSchedule:', error);
      throw error;
    }
  } 

  async getAllMovieSchedules(): Promise<MovieSchedules[]> {
    try {
      const movieSchedule = await db.select().from(movieSchedules);
      return movieSchedule;
    } catch (error) {
      console.error('Error in getAllMovieSchedules:', error);
      throw error;
    }
  }

  

  async getMovieScheduleByDate(date: Date): Promise<MovieSchedules[]> {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // ✅ Extract YYYY-MM-DD format

      const movieSchedule = await db
        .select()
        .from(movieSchedules)
        .where(sql`DATE(${movieSchedules.startTime}) = ${formattedDate}`);

      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieScheduleByDate:', error);
      throw error;
    }
  }


  async getMovieSchedulesByTheaterId(theaterId: string): Promise<MovieSchedules[]> {
    try {
      const movieSchedule = await db.select().from(movieSchedules).where(eq(movieSchedules.theaterId, theaterId));
      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieSchedulesByTheaterId:', error);
      throw error;
    }
  }
}
```

ini adalah service yang akan kita gunakan di route kita. setelah kita selesai dengan service kita pergi ke route

lalu ke route `movie.route.ts`

```ts
import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { MoviesServices } from '../services/movie.services';

const moviesService = new MoviesServices()

export const moviesRoutes = new Elysia({ prefix: '/api/movies' })

  .group('/movies' , (app) => app)
    .get('/', async () => {
      const movies = await moviesService.getMovies();
      return {Movies: movies};
    })
    .get('/:id', async ({ params }: any) => {
      const movie = await moviesService.getMovieById(params.id);
      if (!movie) {
        throw new Error("NOT_FOUND");
      }
      return movie;
    }, {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .post('/', async ({ body }: any) => {
      const movie = await moviesService.createMovie(body);
      return movie;
    },{
      beforeHandle: [authMiddleware],
      body: t.Object({
        title: t.String(),
        description: t.String(),
        genre: t.Array(t.String()),
        duration: t.Number(),
      })
    })

    .put('/:id', async ({ params, body }: any) => {
      const movie = await moviesService.updateMovie(params.id, body);
      return movie;
    }, {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      }),
      body: t.Partial(t.Object({
        title: t.String(),
        description: t.String(),
        genre: t.Array(t.String()),
        duration: t.Number(),
        rating: t.String(),
      }))
    })

    .delete('/:id', async ({ params }: any) => {
      const movie = await moviesService.deleteMovie(params.id);
      return movie;
    }, {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })
```

dan route `schedule.route.ts`

```ts
import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { ScheduleServices } from '../services/schedule.services';

const scheduleService = new ScheduleServices()

export const scheduleRoutes = new Elysia({ prefix: '/api/schedules' })
  .group('/schedules', (app) => app)

    .get('/', async () => scheduleService.getAllMovieSchedules())
    
    .get('/:id', async ({ params, error }) => {
      const schedule = await scheduleService.getMovieSchedulesById(params.id);

      if (!schedule) {
        return error(404, { message: 'Schedule movie not found' });
      }

      return schedule
    }, {
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .get('/getScheduleByMovieId/:movieId', async ({ params }: any) => scheduleService.getMovieSchedulesByMovieId(params.movieId), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        movieId: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .get('/date/:date', async ({ params }: any) => scheduleService.getMovieScheduleByDate(new Date(params.date)), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        date: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .get('/theater/:theaterId', async ({ params }: any) => scheduleService.getMovieSchedulesByTheaterId(params.theaterId), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        theaterId: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .post('/', async ({ body }: any) => {
      return { message: 'Schedule created successfully', schedule: await scheduleService.createMovieSchedule(body)}
    },{
      beforeHandle: [authMiddleware],
      body: t.Object({
        movieId: t.String(), 
        theaterId: t.String(),
        screenNumber: t.Number(),
        startTime: t.Date(),
        endTime: t.Date(),
      }, {
        default: {
          movieId: "123e4567-e89b-12d3-a456-426614174000",  
          theaterId: "456e7890-e12b-34d5-a678-426614174111",  
          screenNumber: 1,  
          startTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),  
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()  
        }
      })
    })
    
    .put('/:id', async ({ params, body }: any) => scheduleService.updateMovieSchedule(params.id, body), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      }),
      body: t.Partial(t.Object({
        movieId: t.String(),
        theaterId: t.String(),
        screenNumber: t.Number(),
        startTime: t.Date(),
        endTime: t.Date(),
      }))
    })

    .delete('/:id', async ({ params }: any) => scheduleService.deleteMovieSchedule(params.id), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })
    
```

lalu yang terakhir file `index.ts` kita
```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { moviesRoutes } from './routes/movie.route';
import { scheduleRoutes } from './routes/schedule.route';
import { errorHandler } from './middleware/errorHandler';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      exp: "1h",
    })
  )
  .use(cors())

  .use(moviesRoutes)
  .use(scheduleRoutes)
  .use(errorHandler)
  
  
  .listen(process.env.PORT || 3004);

console.log(`🦊 Movie service running at ${app.server?.hostname}:${app.server?.port}`);
```

lalu kita bisa jalankan dengan `bun dev` lalu ke `localhost:3004` untuk buka documentasinya di `localhost:3004/docs`.

## 5. Tickets Service
pada tahap terakhir ini kita akan membuat Tickets service.

untuk codenya beberapa ada yang sama settingannya ,tetapi structurenya harus sama seperti yang akan kami perlihatkan,
dan ada beberapa tambahan code untuk penggunaan stipe dan mailer seperti webhook dan template mailer

langsung saja buat project elysia terlebih dahulu
```
bun create elysia "nama service"
```

berikut untuk strukture tickets service
```
├── tickets-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── stripe.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   ├── client.ts
│   │   │   │   └── migrate.ts
│   │   │   ├── emailTemplates/
│   │   │   │   ├── emailTemplates.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   ├── payment.route.ts
│   │   │   │   ├── tickets.route.ts
│   │   │   │   └── webhook.route.ts
│   │   │   ├── services/
│   │   │   │   ├── mailer.services.ts
│   │   │   │   └── tickets.services.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
```

setting `package.json`  dahulu
```json
{
  "name": "tickets-service",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/swagger": "latest",
    "@neondatabase/serverless": "^0.10.4",
    "@types/bcryptjs": "^2.4.6",
    "drizzle-orm": "latest",
    "elysia": "latest",
    "postgres": "latest",
    "stripe": "^17.5.0",
    "nodemailer": "latest",
    "amqplib": "latest"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "latest",
    "@types/amqplib": "latest",
    "@types/nodemailer": "latest"
  },
  "module": "src/index.js"
}
```

lalu install package yang sudah di daftar di `package.json`

```
bun install
```
untuk tambahan di pentingkan untuk menginstal stripe sebagai global environtment kalian agar nantinya kalian bisa login dan
membuat `STRIPE_WEBHOOK_SECRET` variable untuk `.env` kalian dan di rekomendasikan menggunakan sandbox karna masih aplikasi yang di develop
dan sebagai bahan belajar.

lalu kita setting drizzle terlebih dahulu 
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/db/schema.ts',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true
} satisfies Config
```

lalu buat file `.env` untuk menaruh variable penting seperti url database kalain
```
DATABASE_URL=URL_DB
JWT_SECRET=randomparanolep
PORT=3005
SCHEDULE_SERVICE_URL=http://localhost:3004/api/schedules
USERS_SERVICE_URL=http://localhost:3001/api/users
RESERVATIONS_SERVICE_URL=http://localhost:3003/api/reservations

# STRIPE CONFIG
STRIPE_SECRET_KEY=STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET
SUCCESS_URL=http://localhost:3005/success
CANCEL_URL=http://localhost:3005/cancel

# NODEMAILER CONFIG
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=USER
SMTP_PASS=PASS
SMTP_FROM=FROM_MAIL
```
> jika kalian tidak memiliki stripe key di harapkan untuk membuat akun dlu di website [stripe](https://stripe.com/) langsung
dan juga termasuk untuk nodemailernya.

> untuk mendapatkan `STRIPE_WEBHOOK_SECRET` kalian perlu menjalankan
```
stripe listen --forward-to localhost:3000/api/webhook
```
> di terminal kalian. nantinya ini akan menjadi endpoit API kita untuk stripe 
mengembalikan request hasil payment yang kita lakukan.

jika sudah atur config stripe kalian ke dalam project dengan `STRIPE_SECRET_KEY` kalian
```ts
// src/config/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

setelah ini setting config untuk DB seperti sebelumnya. mari kita masuk ke pembuatan schema

ini code untuk `client.ts`, file ini untuk define db kita dengan drizzle
```ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

lalu kita buat file untuk migrasi schema kita nanti ke dalam database

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
  await sql`CREATE SCHEMA IF NOT EXISTS tickets;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

jika sudah pengaturan berikut mari kitake pembuatan schema di `schema.ts`

```ts
import { pgTable, varchar, timestamp, uuid, unique, decimal } from 'drizzle-orm/pg-core';

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id').notNull(),
  scheduleId: varchar('schedule_id').notNull(),
  seatId: varchar('seat_id').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
}, (table) => {
  return {
    uniqueSeat: unique().on(table.userId, table.scheduleId, table.seatId) // ✅ UNIQUE constraint
  };
});
export type Tickets = typeof tickets.$inferSelect;
```

lalu kalian bisa jalankan ini untuk generate dan migrate table ke database kalian

```
bun db:generate
// atau
drizzle-kit generate

// untuk ngepush schema kalian ke dalam database
bun db:migrate
bun db:push
```

lalu mari kita buat middlewarenya. pertama kita mulai dengan `authMiddleware.ts`

```ts
// src/middleware/authMiddleware.ts
export const authMiddleware = async ({ jwt, set, cookie }: any) => {
  const authToken = cookie?.auth?.value; // Pastikan cookie auth tersedia
  if (!authToken) {
    set.status = 401;
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Verifikasi token JWT
    const payload = await jwt.verify(authToken);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { error: 'Unauthorized: Invalid token' };
    }

    // Return user data agar bisa digunakan di route lain
    return 
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    set.status = 401;
    return { error: 'Unauthorized: Token expired or invalid' };
  }
}
```

lalu ke `errorHandler.ts`

```ts
import { Elysia } from 'elysia';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Resource not found' };
      default:
        set.status = 500;
        return { error: 'Internal server error' };
    }
  });
```

setelah middleware selesai mari kita ke bagian service di `tickets.service.ts`

```ts
import { db } from '../db/client';
import { eq, sql } from 'drizzle-orm';
import { tickets, Tickets } from '../db/schema';
import { sendEmail } from './mailer.services';
import { emailTemplates } from '../emailTemplates/emailTemplates';
import { stripe } from '../config/stripe';
import dotenv from 'dotenv';
dotenv.config();

const formatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const checkIdForCreateTickets = async (ticketData: Tickets) => {
  dotenv.config();
  try {

    const userResponse = await fetch(`${process.env.USERS_SERVICE_URL}/${ticketData.userId}`);
    if (!userResponse.ok) {
      return Promise.reject(userResponse);
    }

    const user = await userResponse.json().catch(() => null);

    const movieScheduleResponse = await fetch(`${process.env.SCHEDULE_SERVICE_URL}/${ticketData.scheduleId}`);
    if (!movieScheduleResponse.ok) {
      return Promise.reject(movieScheduleResponse);
    }

    const movieSchedule = await movieScheduleResponse.json().catch(() => null);

    const reservationSeatsResponse = await fetch(`${process.env.RESERVATIONS_SERVICE_URL}/${ticketData.seatId}`);
    if (!reservationSeatsResponse.ok) {
      return Promise.reject(reservationSeatsResponse);
    }

    const reservationSeats = await reservationSeatsResponse.json().catch(() => null);

    if (reservationSeats.status !== 'available') {
      return Promise.reject("Seat not available for this reservation");
    }

    return {user, movieSchedule, reservationSeats};
  }catch (error) {
    throw error;
  }
};

export class TicketsServices {

  

  async getTicketsByUserId(userId: string): Promise<Tickets[]> {
    try {
      const ticket = await db.select().from(tickets).where(eq(tickets.userId, userId));
      return ticket;
    } catch (error) {
      console.error('Error in getTicketsByUserId:', error);
      throw error;
    }
  }

  async getTicketsByScheduleId(scheduleId: string): Promise<Tickets[]> {
    try {
      const ticketsList = await db.select().from(tickets).where(eq(tickets.scheduleId, scheduleId));
      return ticketsList;
    } catch (error) {
      console.error('Error in getTicketsByScheduleId:', error);
      throw error;
    }
  }

  async createTicket(ticketData: Tickets) {
    try {
      const data = await checkIdForCreateTickets(ticketData);

      // Stripe season
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            // @ts-ignore
            unit_amount: Math.round(ticketData?.price * 100),
            product_data: {
              name: data?.movieSchedule?.movies?.title,
              description: `Film ${data?.movieSchedule?.movies?.title} 
              at ${formatter.format(new Date(data?.movieSchedule?.movie_schedules?.startTime))} 
              to ${formatter.format(new Date(data?.movieSchedule?.movie_schedules?.endTime))}
              in seat ${data?.reservationSeats?.seatCode}`,
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.CANCEL_URL,
        customer_email: data?.user?.email,
        metadata: {
          customerId: data?.user?.id,
          film: data?.movieSchedule?.movies?.title,
          seats: data?.reservationSeats?.seatCode,
          startTime: data?.movieSchedule?.movie_schedules?.startTime,
        }
      });

      const [ticket] = await db.insert(tickets).values({...ticketData, stripeSessionId: session.id}).returning();

      // Send email
      await this.handleTicketPaymentNotification(
        data?.user?.email, 
        data?.movieSchedule?.movies?.title, 
        data?.reservationSeats?.seatCode, 
        data?.movieSchedule?.movie_schedules?.startTime, 
        session?.url,
      );
      
      return {ticket, checkoutSession: session.url};
    } catch (error) {
      console.error('Error in createTicket:', error);
      throw error;
    }
  }

  async updateTicket(id: string, ticketData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedTicket] = await db.update(tickets)
        .set(ticketData)
        .where(eq(tickets.id, id))
        .returning();

      if (!updatedTicket) {
        console.warn(`Ticket not found with ID: ${id}`);
        throw new Error('Failed to update ticket');
      }

      return updatedTicket; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateTicket:', error);
      throw error;
    }
  }

  async deleteTicket(id: string) {
    try {
      const [deletedTicket] = await db.delete(tickets).where(eq(tickets.id, id)).returning();
      if (!deletedTicket) {
        console.warn(`Ticket not found with ID: ${id}`);
        throw new Error('Ticket not found');
      }
      return deletedTicket;
    } catch (error) {
      console.error('Error in deleteTicket:', error);
      throw error;
    }
  }

  

  async handleTicketPaymentNotification(email: string, movieName: string, seatCode: string, date: string, paymentLink: any) {
    try {
      const result = await sendEmail(
        email, 
        "Ticket Payment Notification", 
        emailTemplates.ticketPayment(movieName, seatCode, date, paymentLink)
      )

      return {
        success: true,
        message: 'Test notification sent successfully',
        details: result
      }
        
    } catch (error) {
      console.error('Error in Handle Ticket Payment Notification:', error);
      throw error;
    }
  }

  async handleTicketPayedNotification(email: string, movieName: string, seatCode: string, date: string) {
    try {
      const result = await sendEmail(
        email, 
        "Ticket Payment Notification", 
        emailTemplates.ticketPayed(movieName, seatCode, date)
      )

      return {
        success: true,
        message: 'Test notification sent successfully',
        details: result
      }
        
    } catch (error) {
      console.error('Error in Handle Ticket Payment Notification:', error);
      throw error;
    }
  }

  async updatePaymentStatus(sessionId: string, status: 'paid' | 'failed'): Promise<void> {
    try {
      console.log(`Updating payment status for session ${sessionId} to ${status}`);
      
      // Verify the payment with Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        throw new Error('Invalid session ID');
      }

      // Update the ticket status
      const [updatedTicket] = await db
        .update(tickets)
        .set({ 
          paymentStatus: status,
          issuedAt: new Date()
        })
        .where(eq(tickets.stripeSessionId, sessionId))
        .returning();

      console.log('Updated booking:', updatedTicket);
      
      if (!updatedTicket) {
        throw new Error('Booking not found for this session');
      }

      const reservationResponse = await fetch(`${process.env.RESERVATIONS_SERVICE_URL}/updateStatus/${updatedTicket.seatId}`, {
        method: "PUT",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!reservationResponse.ok) {
        return Promise.reject(reservationResponse);
      }

      const data = await checkIdForCreateTickets(updatedTicket);

      // Here you could add additional success actions like:
      if (status === 'paid') {
        // Send confirmation email
        // Update room availability
        
        // Send email
        await this.handleTicketPaymentNotification(
          data?.user?.email, 
          data?.movieSchedule?.movies?.title, 
          data?.reservationSeats?.seatCode, 
          data?.movieSchedule?.movie_schedules?.startTime, 
          session?.url,
        );
        // Send notification to hotel staff
        console.log(`Payment completed for booking ${updatedTicket.id}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async handleFailedPayment(sessionId: string, reason: 'cancelled' | 'failed'): Promise<void> {
    try {
      const [ticket] = await db
        .update(tickets)
        .set({ 
          paymentStatus: reason,
          issuedAt: new Date()
        })
        .where(eq(tickets.stripeSessionId, sessionId))
        .returning();

      if (!ticket) {
        throw new Error('Booking not found for this session');
      }

      // Release the room dates back to availability

      // You might want to notify the customer
    } catch (error) {
      console.error(`Error handling ${reason} payment:`, error);
      throw error;
    }
  }
}
```

code untuk `mailer.service.ts`

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

ini adalah service yang akan kita gunakan di route kita. setelah kita selesai dengan service kita pergi ke route

lalu ke route `tickets.route.ts`

```ts
import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { TicketsServices } from '../services/tickets.services';
import { Tickets } from '../db/schema';

const ticketsService = new TicketsServices()

export const ticketsRoutes = new Elysia({ prefix: '/api/tickets' })
  // .use(authMiddleware)

  .get('/getOwnTicket', async ({ jwt, set, cookie: { auth } }: any) => {

    const profile = await jwt.verify(auth.value)

    if (!profile) {
        set.status = 401
        return 'Unauthorized'
    }
    const tickets = await ticketsService.getTicketsByUserId(profile.userId as string);
    return tickets;
})

  .get('/getByUserId/:userId', async ({ params }) => {
      const tickets = await ticketsService.getTicketsByUserId(params.userId as string);
      return tickets;
  },{
    params: t.Object({
      userId: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .get('/getByScheduleId/:scheduleId', async ({ params }) => {
    const tickets = await ticketsService.getTicketsByScheduleId(params.scheduleId as string);
    return tickets;
  },{
    params: t.Object({
      scheduleId: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .post('/', async ({ body }: any) => {
    
    return await ticketsService.createTicket(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      userId: t.String(),
      scheduleId: t.String(),
      seatId: t.String(),
      price: t.Number(),
    })
  })

  .post('/orderTickets', async ({jwt, body, cookie: { auth } }: any) => {
    const profile = await jwt.verify(auth.value)

    return await ticketsService.createTicket({...body, userId: profile.userId})
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      scheduleId: t.String(),
      seatId: t.String(),
      price: t.Number(),
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await ticketsService.updateTicket(params.id, body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
    body: t.Partial(t.Object({
      userId: t.String(),
      scheduleId: t.String(),
      seatId: t.String(),
      price: t.Number(),
    }))
  })

  .delete('/:id', async ({ params }: any) => {
    return await ticketsService.deleteTicket(params.id)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })


```

code route `payment.route.ts`

```ts
// src/controllers/paymentController.ts
import { Elysia, t } from 'elysia';
import { TicketsServices } from '../services/tickets.services';

export const paymentRoute = new Elysia()
  .get('/success', async ({ query }) => {
    try {
      const sessionId = query.session_id;
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const ticketService = new TicketsServices();
      await ticketService.updatePaymentStatus(sessionId, 'paid');

      return {
        status: 'success',
        message: 'Payment completed successfully!'
      };
    } catch (error: any) {
      console.error('Payment success error:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  })
  .get('/cancel', async ({ query }) => {
    try {
      const sessionId = query.session_id;
      if (sessionId) {
        const ticketService = new TicketsServices();
        await ticketService.handleFailedPayment(sessionId, 'cancelled');
      }

      return {
        status: 'cancelled',
        message: 'Payment was cancelled. You can retry the payment later.'
      };
    } catch (error: any) {
      console.error('Payment cancellation error:', error);
      throw new Error(`Payment cancellation failed: ${error.message}`);
    }
  });
```

dan code untuk `webhook.ts`

```ts
// src/controllers/paymentController.ts
import { Elysia, t } from 'elysia';
import { TicketsServices } from '../services/tickets.services';

export const paymentRoute = new Elysia()
  .get('/success', async ({ query }) => {
    try {
      const sessionId = query.session_id;
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const ticketService = new TicketsServices();
      await ticketService.updatePaymentStatus(sessionId, 'paid');

      return {
        status: 'success',
        message: 'Payment completed successfully!'
      };
    } catch (error: any) {
      console.error('Payment success error:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  })
  .get('/cancel', async ({ query }) => {
    try {
      const sessionId = query.session_id;
      if (sessionId) {
        const ticketService = new TicketsServices();
        await ticketService.handleFailedPayment(sessionId, 'cancelled');
      }

      return {
        status: 'cancelled',
        message: 'Payment was cancelled. You can retry the payment later.'
      };
    } catch (error: any) {
      console.error('Payment cancellation error:', error);
      throw new Error(`Payment cancellation failed: ${error.message}`);
    }
  });
```

webhook ini bertujuan untuk API yang berinteraksi dengan stripenya

lalu yang terakhir file `index.ts` kita
```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { reservationsRoutes } from './routes/reservations.route';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      exp: "1h",
    })
  )
  .use(cors({
    origin: "http://localhost:3005", // Replace with your frontend URL
    credentials: true, // Allow sending cookies
  }))

  .use(reservationsRoutes)
  .use(errorHandler)
  .listen(process.env.PORT || 3005);

console.log(`🦊 Seat Reservastion service running at ${app.server?.hostname}:${app.server?.port}`);
```

lalu kita bisa jalankan dengan `bun dev` lalu ke `localhost:3005` untuk buka documentasinya di `localhost:3005/docs`.

karna kita menggunakan testing sandbox di stripe jangan menggunakan kartu kredit asli kalian. gunakan kartu kredit code testing yang sudah di siapkan oleh stripe kalian bisa lihat di link ini https://docs.stripe.com/testing 


# Testing Project

setelah kalian menyelesaikan code di atas untuk semua service saatnya kita testing manual dan alur kerjanya
ini urutan alurnya:
1. register account
2. login account
3. create theather, movie, movie schedule
4. order tickets

mari kita testing

## register
kita bisa melakukan register di service user dengan localhost `http://localhost:3001/docs#tag/default/POST/auth/register`

![image](https://github.com/user-attachments/assets/393d720d-f61e-43bf-85ba-9a89ae731139)

## login
setelah kita register baru kita bisa login dengan account yang kita register tadi di `http://localhost:3001/docs#tag/default/POST/auth/login`
jika login berhasil maka kalian akan mendapatkan return token. kurang lebih seperti ini
`eyJhbGciOiJIUzI1NiJ9.eyJyZWZyZXNoIjp7Im1heEFnZSI6NjA0ODAwLCJodHRwT25seSI6dHJ1ZX0sInVzZXJJZCI6IjMyY2NhOTkxLTQ4NTYtNDE3OS04ODI3LTNkOTA1MjYxMmFmMyIsImVtYWlsIjoidGVya29pempva3NvbkBnbWFpbC5jb20iLCJwaG9uZSI6IjA5ODc2NTQzMjExIn0.akkxmSKQMZIiYAtXT9XzzRgfk0Rv606utq7u7Lc3riA`

jwt ini akan langusung tersimpan di dalam cookie. kalian bisa check di dalam inpect -> aplplication -> Cookies -> auth.

kurang leih akan terlihat seperti ini

![image](https://github.com/user-attachments/assets/94344753-e728-4ff0-b5b3-21eeed65be3e)

## theather, movie, movie schedule and seat

jika kalian sudah login maka kalian sudah bisa membuat data untuk theater, movie, movie schedule dan seat reservation.

mari kita coba pembuatan *theater* di link ini `http://localhost:3002/docs#tag/default/POST/api/theaters/`

![image](https://github.com/user-attachments/assets/826075a8-8992-413b-96f5-44a37811d8c4)

lalu ke pembuatan *movie* dan *movie schedule* di `http://localhost:3004/docs`

- movie
`http://localhost:3004/docs#tag/default/POST/api/movies/`
![image](https://github.com/user-attachments/assets/5710f9ea-0f9a-4ddd-9a9d-f27f042d9af5)

- movie schedule
`http://localhost:3004/docs#tag/default/POST/api/schedules/`
![image](https://github.com/user-attachments/assets/576d3c06-95de-4edb-8f1b-079e51d85395)

setelah movie mari kita buat untuk *seat* nya
`http://localhost:3003/docs#tag/default/POST/api/reservations/`
![image](https://github.com/user-attachments/assets/8f4268f8-f986-4782-8f9e-2f21b76b87ca)

## order ticket
setelah membuat seat yang memiliki jadwal tayang movie, kita bisa memesan ticket untuk kursi tersebut di `http://localhost:3005/docs#tag/default/POST/api/tickets/orderTickets` 

![image](https://github.com/user-attachments/assets/092e7759-b08e-4f7e-a940-a641e3f81448)

setelah berhasil order ticket maka akan muncul link *checkoutSession* di response untuk melakukan pembayaran atau bisa di check di gmail anda karna sudah terintegrate. ***PASTIKAN BAHWA EMAIL YANG KALIAN GUNAKAN SAMA DAN BISA DI BUKA BENAR*** maka akan muncul seperti ini

![image](https://github.com/user-attachments/assets/104e11fe-3217-4fc2-918d-d088fd57386c)

lalu bisa kita buka link nya dan akan langsung masuk ke weisite stripe seperti ini

![image](https://github.com/user-attachments/assets/fdda2ed4-4cfe-4b2b-93ef-5bea4389af13)

kalian bisa memasukan nomor cc testing yang ada di [sini](https://docs.stripe.com/testing) untuk ngetest pembayaran kalian. dan jika berhasil akan di lempar ke link payment success seperti ini `http://localhost:3005/success?session_id=cs_test_a1JtjCinLvHaptStBNKG5tR60RyaCsGG9dKDcjgr40yR1e6SBlBzU9r6tq` dan jika gagal maka `http://localhost:3005/cancel?session_id=cs_test_a1JtjCinLvHaptStBNKG5tR60RyaCsGG9dKDcjgr40yR1e6SBlBzU9r6tq`





