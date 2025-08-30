# Project Study Microservice Synchronous

kali ini kalian akan peraktekan untuk membuat aplikasi e-commerce system dengan 3 microservice yaitu Users dan Orders
dan juga untuk cycle nya kita akan menggunakan pm2 agar mudah di jalankan di lokal dan bisa juga untuk monitoring dan lagging
## Setup project

seperti biasa buat folder project terselbih dahulu

```
mkdir microservices-testing
cd microservices-testing
```

lalu install pm2 terlebih dahulu
```
npm install pm2 -g
```
pm2 berguna untuk menjalankan code dan memonitoring server yang sedang
berjalan di lokal kalian

lalu buat structure folder project seperti ini
```
microservices-testing/
├── gateway/
│   ├── package.json
│   └── src/
│       └── index.ts
├── user-service/
│   ├── package.json
│   ├── database.sqlite
│   └── src/
│       ├── index.ts
│       └── schema.ts
├── order-service/
│   ├── package.json
│   ├── database.sqlite
│   └── src/
│       ├── index.ts
│       └── schema.ts
├── package.json
├── ecosystem.config.js
└── README.md
```

kemudian di setiap serviec directory dan gateway, inisialisasi dan install dependencies

```
// ini untuk service user
cd services/user-service
bun init
bun add elysia @elysiajs/swagger @elysiajs/cors

// ini untuk service user
cd services/order-service
bun init
bun add elysia @elysiajs/swagger @elysiajs/cors

// ini untuk service user
cd services/gateway
bun init
bun add elysia @elysiajs/swagger @elysiajs/cors
```

ulangi di setiap service dan gateway

## Code and config

pertama mari kita setup configuration project
```json
// package.json untuk root directory
{
  "name": "microservices-root",
  "version": "1.0.0",
  "description": "Microservices with Bun and Elysia",
  "scripts": {
    "install:all": "cd gateway && bun install && cd ../user-service && bun install && cd ../order-service && bun install",
    "start": "pm2 start ecosystem.config.js",
    "stop": "pm2 stop all",
    "restart": "pm2 restart all",
    "delete": "pm2 delete all",
    "logs": "pm2 logs",
    "status": "pm2 status",
    "dev:gateway": "cd gateway && bun run src/index.ts",
    "dev:user": "cd user-service && bun run src/index.ts",
    "dev:order": "cd order-service && bun run src/index.ts"
  },
  "dependencies": {
    "pm2": "^5.3.0"
  }
}
```

code `package.json` ini dibuat untuk mempermudah saat kita menjalankan
project microservice ini dengan menggunakan library pm2

lalu ke `ecosystem.config.js`

```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'gateway',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './gateway',
      watch: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/gateway-error.log',
      out_file: 'logs/gateway-out.log'
    },
    {
      name: 'user-service',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './user-service',
      watch: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/user-error.log',
      out_file: 'logs/user-out.log'
    },
    {
      name: 'order-service',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './order-service',
      watch: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/order-error.log',
      out_file: 'logs/order-out.log'
    }
  ]
}
```
`ecosystem.config.js` ini digunakan untuk menjalankan pm2 ecosystem di project
microserviceini

```
pm2 start ecosystem.config.js
```


lalu untuk code di setiap service 

### 1. user-service

- user-service/src/schema.ts
```js

// user-service/src/schema.ts
export interface User {
  id: number
  name: string
  email: string
}
```

- user-service/src/index.ts
```js
// user-service/src/index.ts
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { Database } from 'bun:sqlite'

const db = new Database('database.sqlite')
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )
`)

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'User Service',
        version: '1.0.0'
      }
    }
  }))
  .get('/api/users', () => {
    const users = db.prepare('SELECT * FROM users').all()
    return { success: true, data: users }
  })
  .get('/api/users/:id', ({ params: { id } }) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: user }
  })
  .post('/api/users', ({ body }) => {
    try {
      const { name, email } = body
      const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      const result = stmt.run(name, email)
      
      return {
        success: true,
        data: {
          id: result.lastInsertId,
          name,
          email
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String()
    })
  })

app.listen(3001, () => {
  console.log('👥 User service running on http://localhost:3001')
})
```

### 2. order-service

- order-service/src/schema.ts
```js
// order-service/src/schema.ts
export interface Order {
  id: number
  userId: number
  amount: number
  status: string
}
```
- order-service/src/index.ts
```js
// order-service/src/index.ts
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { Database } from 'bun:sqlite'

const db = new Database('database.sqlite')
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  )
`)

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Order Service',
        version: '1.0.0'
      }
    }
  }))
  .get('/api/orders', () => {
    const orders = db.prepare('SELECT * FROM orders').all()
    return { success: true, data: orders }
  })
  .get('/api/orders/:userId', ({ params: { userId } }) => {
    const orders = db.prepare('SELECT * FROM orders WHERE userId = ?').all(userId)
    return { success: true, data: orders }
  })
  .post('/api/orders', async ({ body }) => {
    try {
      const { userId, amount } = body
      
      // Verify user exists before creating order
      const userResponse = await fetch(`http://localhost:3001/api/users/${userId}`)
      if (!userResponse.ok) {
        throw new Error('User not found')
      }
      
      // Insert the order
      db.prepare('INSERT INTO orders (userId, amount, status) VALUES (?, ?, ?)').run(userId, amount, 'pending')
      
      // Fetch the last inserted order
      const lastOrder = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 1').get()
      
      return {
        success: true,
        data: lastOrder
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }, {
    body: t.Object({
      userId: t.Number(),
      amount: t.Number()
    })
  })

app.listen(3002, () => {
  console.log('🛍️  Order service running on http://localhost:3002')
})
```

### 3. gateway

- gateway/src/index.ts

```js
// gateway/src/index.ts
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Microservices Gateway API',
        version: '1.0.0',
        description: 'Gateway API for User and Order services'
      },
      tags: [
        { name: 'users', description: 'User operations' },
        { name: 'orders', description: 'Order operations' }
      ]
    }
  }))

// Order Service Routes
app.group('/orders', app => app
  .get('/', async () => {
    try {
      const response = await fetch('http://localhost:3002/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    detail: {
      tags: ['orders'],
      summary: 'Get all orders'
    }
  })
  .get('/:userId', async ({ params: { userId } }) => {
    try {
      const response = await fetch(`http://localhost:3002/api/orders/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user orders')
      const data = await response.json()
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    detail: {
      tags: ['orders'],
      summary: 'Get orders by user ID'
    }
  })
  .post('/', async ({ body }) => {
    try {
      const response = await fetch('http://localhost:3002/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }
      
      const data = await response.json()
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      userId: t.Number(),
      amount: t.Number()
    }),
    detail: {
      tags: ['orders'],
      summary: 'Create a new order'
    }
  })
)

// User Service Routes (similar updates needed)
app.group('/users', app => app
  .get('/', async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    detail: {
      tags: ['users'],
      summary: 'Get all users'
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      const data = await response.json()
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    detail: {
      tags: ['users'],
      summary: 'Get user by ID'
    }
  })
  .post('/', async ({ body }) => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }
      
      const data = await response.json()
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String()
    }),
    detail: {
      tags: ['users'],
      summary: 'Create a new user'
    }
  })
)

app.listen(3000, () => {
  console.log('🦊 Gateway running on http://localhost:3000')
  console.log('📚 Swagger documentation available at http://localhost:3000/docs')
})
```

## Running dan Testing 
ketika kalian sudah selesai menulis code di atas kalian dapat menjalankan project kalian dengan cara kemabli ke root folder terlebih dahulu lalu jalankan `npm run start` di dalam terminal kalian

jika sudah running maka akan muncul seperti ini

![image](https://github.com/user-attachments/assets/fba4c6f0-e295-4bc2-86f2-56c5be68203c)

jika status online maka service berhasil berjalan dengan baik jika tidak maka ada yang salah pada code kalian dan service tidak akan berjalan.

lalu kemudian kalian bisa testing API kalian di dalam documentasi swagger gateway `http://localhost:3000/docs`

![image](https://github.com/user-attachments/assets/bc47cf32-c4f1-4905-bdd3-0f2f29c7500e)

jika terbuka maka kalian akan langsung mencoba api microservice sederhana kalian.

## Breakcode
pada tahap ini kalian sudah mengetahui bagai mana micro service berjalan. jika kurang paham saya tunjukan point yang perlu diketahui

1. kalian bisa lihat pada code ini
```js
.post('/api/orders', async ({ body }) => {
    try {
      const { userId, amount } = body
      
      // Verify user exists before creating order
      const userResponse = await fetch(`http://localhost:3001/api/users/${userId}`)
      if (!userResponse.ok) {
        throw new Error('User not found')
      }
      
      // Insert the order
      db.prepare('INSERT INTO orders (userId, amount, status) VALUES (?, ?, ?)').run(userId, amount, 'pending')
      
      // Fetch the last inserted order
      const lastOrder = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 1').get()
      
      return {
        success: true,
        data: lastOrder
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
```
ini adalah code dari create order. untuk memverifikasi apakah id user ini ada kita perlu fetch api serve user kita di dalam api create order. 

2. jika kalian lihat folder directory service kalian, di order dan user service ada sebuah `databse.sqlite` di masing2 database berikut hanya memiliki tabel yang di gunakan untuk servicenya masing2. jadi jika kalian ingin melakukan sesuatu dari service order ke database user, maka kalian harus membuat api di user service yang akan di hit dari order service seperti point pertama.
