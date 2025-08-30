# Websocket
## 1. Apa itu Websocket
![image](https://github.com/user-attachments/assets/73e9e8aa-e3cf-42e9-a553-7dfbf8d006f2)

WebSocket adalah protokol komunikasi dua arah yang memungkinkan pertukaran data secara real-time antara server dan klien melalui koneksi TCP yang persisten. WebSocket memungkinkan komunikasi lebih efisien dibandingkan dengan HTTP karena koneksi terbuka dan tetap terjaga sepanjang sesi komunikasi.

**Fitur Utama WebSocket**:
- `Koneksi Persisten`: Setelah koneksi WebSocket dibuka, ia tetap terbuka untuk pertukaran data, sehingga mengurangi overhead yang terjadi pada setiap permintaan HTTP.
- `Komunikasi Dua Arah`: Baik klien maupun server bisa mengirimkan pesan ke pihak lainnya tanpa harus menunggu permintaan dari pihak lain.
- `Efisiensi`: Mengurangi latensi karena tidak perlu membuat permintaan HTTP berulang kali.
- `Real-Time`: Ideal untuk aplikasi yang membutuhkan data yang selalu diperbarui secara real-time (misalnya chat, game online, monitoring data).

## 2. Cara Kerja WebSocket

1. Handshake (Proses Pembukaan Koneksi) WebSocket dimulai dengan permintaan HTTP biasa (handshake) untuk meminta pembukaan koneksi WebSocket.

Contoh Handshake:
```
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

Jika server mendukung WebSocket, ia akan merespons dengan:

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: x3JJHMbDL1EzLkh9tH9J1GoYf6YbERqYZyI79g4Fj60=
```

2. **Data Transfer** Setelah handshake berhasil, koneksi WebSocket terbuka, dan data bisa dikirim dalam bentuk frame (potongan kecil dari pesan). Data bisa berupa teks, gambar, atau data biner (seperti gambar atau file audio/video).

3. **Penutupan Koneksi** Koneksi WebSocket bisa ditutup oleh salah satu pihak (klien atau server) menggunakan frame penutupan. Proses penutupan juga dilakukan dengan pesan yang lebih ringan, dibandingkan dengan HTTP yang biasanya memerlukan permintaan dan respons terpisah.


## 3. WebSocket vs HTTP

**HTTP**:

- `Satu Arah`: Klien mengirim permintaan, dan server memberikan respons.
- `Stateless`: Setiap permintaan adalah transaksi terpisah. Server tidak menyimpan status dari satu permintaan ke permintaan lainnya.
- `Overhead`: Setiap permintaan membutuhkan header HTTP yang lengkap, yang bisa menambah overhead.


**WebSocket**:

- `Dua Arah`: Keduanya (klien dan server) dapat mengirim data kapan saja.
- `Koneksi Persisten`: Koneksi tetap terbuka untuk komunikasi dua arah sepanjang waktu.
- `Efisiensi`: Pengiriman data lebih efisien karena tidak perlu membuat koneksi baru setiap kali berkomunikasi.

## 4. Keamanan WebSocket
WebSocket menggunakan protokol wss:// (seperti HTTPS) untuk mengenkripsi komunikasi dan memastikan data yang dikirimkan aman. Ini mengurangi risiko serangan seperti man-in-the-middle.

Beberapa hal yang perlu diperhatikan terkait keamanan:

- **Useran WSS**: Selalu gunakan WebSocket dengan wss:// untuk mengenkripsi koneksi.
- **Autentikasi**: Pastikan klien terautentikasi dengan benar sebelum membuka koneksi WebSocket.
- **Rate Limiting**: Batasi jumlah koneksi WebSocket yang dapat dibuat dari satu alamat IP untuk mencegah serangan DoS.
- **Validasi Pesan**: Pastikan pesan yang diterima valid dan tidak menyebabkan eksekusi kode berbahaya.

## 5. WebSocket ElysiaJs & HonoJs

Jika Kalian memakai Elysia (sebuah framework untuk Bun.js), Kalian dapat memanfaatkan integrasi WebSocket dengan cara serupa dengan bunjs.
Elysia.js menyediakan dukungan WebSocket yang kuat, memungkinkan Kalian membangun aplikasi real-time dengan mudah. Berikut penjelasan komprehensif tentang cara kerja WebSocket di Elysia:

### Dasar-dasar WebSocket di Elysia

Di Elysia, fungsi WebSocket tersedia secara langsung tanpa memerlukan plugin tambahan. Kalian dapat mendefinisikan endpoint WebSocket menggunakan metode `.ws()`:

```typescript
import { Elysia } from 'elysia'

const app = new Elysia()
  .ws('/ws', {
    // Handler WebSocket di sini
    open(ws) {
      console.log('Koneksi dibuka')
    },
    message(ws, message) {
      console.log('Diterima:', message)
      ws.send(`Echo: ${message}`)
    },
    close(ws, code, message) {
      console.log(`Koneksi ditutup: ${code} ${message}`)
    },
    error(ws, error) {
      console.error('Error WebSocket:', error)
    }
  })
  .listen(3000)
```

### Handler WebSocket

Elysia menyediakan beberapa handler untuk berbagai event WebSocket:

1. **open**: Dipicu ketika klien membuat koneksi
2. **message**: Dipicu ketika klien mengirim pesan
3. **close**: Dipicu ketika koneksi ditutup
4. **error**: Dipicu ketika terjadi kesalahan

## Konteks WebSocket (objek ws)

Objek `ws` menyediakan metode dan properti untuk berinteraksi dengan koneksi WebSocket:

- `ws.send(data)`: Mengirim data ke klien
- `ws.close(code?, reason?)`: Menutup koneksi
- `ws.publish(topic, data)`: Mempublikasikan data ke topik tertentu (untuk pub/sub)
- `ws.subscribe(topic)`: Berlangganan ke topik
- `ws.unsubscribe(topic)`: Berhenti berlangganan dari topik
- `ws.id`: Pengenal unik untuk koneksi
- `ws.data`: Data yang dibagikan sepanjang siklus hidup permintaan

### Menyiarkan Pesan (Broadcasting)

Untuk menyiarkan pesan ke semua klien yang terhubung, Kalian biasanya memelihara daftar koneksi aktif:

```typescript
const app = new Elysia()
  .state('connections', new Set())
  .ws('/ws', {
    open(ws) {
      app.store.connections.add(ws)
    },
    message(ws, message) {
      // Siarkan ke semua koneksi
      for (const connection of app.store.connections) {
        connection.send(message)
      }
    },
    close(ws) {
      app.store.connections.delete(ws)
    }
  })
  .listen(3000)
```

### WebSocket dengan Autentikasi

Kalian dapat mengimplementasikan autentikasi untuk koneksi WebSocket:

```typescript
const app = new Elysia()
  .ws('/ws', {
    beforeHandle: ({ request, set }) => {
      const token = new URL(request.url).searchParams.get('token')
      if (!token || !validateToken(token)) {
        set.status = 401
        return 'Tidak Diizinkan'
      }
    },
    open(ws) {
      // Koneksi sudah diautentikasi
      console.log('Koneksi terautentikasi dibuka')
    }
  })
  .listen(3000)
```

### Pola Pub/Sub

WebSocket Elysia mendukung pola pub/sub untuk komunikasi berbasis topik:

```typescript
const app = new Elysia()
  .ws('/chat/:room', {
    open(ws) {
      const { room } = ws.data.params
      ws.subscribe(room)
      ws.publish(room, `User bergabung ke ${room}`)
    },
    message(ws, message) {
      const { room } = ws.data.params
      ws.publish(room, message)
    },
    close(ws) {
      const { room } = ws.data.params
      ws.unsubscribe(room)
      ws.publish(room, `User meninggalkan ${room}`)
    }
  })
  .listen(3000)
```

### Implementasi Sisi Klien

Berikut cara menghubungkan ke endpoint WebSocket Elysia dari browser:

```javascript
const ws = new WebSocket(`ws://${window.location.host}/ws`)

ws.onopen = () => {
  console.log('Terhubung ke server')
  ws.send('Halo, server!')
}

ws.onmessage = (event) => {
  console.log('Diterima:', event.data)
}

ws.onclose = (event) => {
  console.log('Koneksi ditutup:', event.code, event.reason)
}

ws.onerror = (error) => {
  console.error('Error WebSocket:', error)
}
```

### Penanganan Data JSON

Untuk data terstruktur, Kalian bisa menggunakan JSON:

```typescript
// Server
const app = new Elysia()
  .ws('/ws', {
    message(ws, message) {
      if (typeof message === 'string') {
        try {
          const data = JSON.parse(message)
          // Tangani data terstruktur
          ws.send(JSON.stringify({ status: 'diterima', data }))
        } catch (e) {
          ws.send(JSON.stringify({ error: 'JSON tidak valid' }))
        }
      }
    }
  })
  .listen(3000)

// Klien
ws.send(JSON.stringify({ type: 'chat', message: 'Halo!', user: 'Alice' }))
```

### WebSocket dengan Middleware

Kalian dapat menerapkan middleware ke rute WebSocket:

```typescript
const logger = (ws) => {
  console.log(`Koneksi baru: ${ws.id}`)
  return () => {
    console.log(`Koneksi ditutup: ${ws.id}`)
  }
}

const app = new Elysia()
  .ws('/ws', {
    beforeHandle: [logger],
    message(ws, message) {
      ws.send(`Echo: ${message}`)
    }
  })
  .listen(3000)
```

Untuk detail pembelajaran websocket elysia kalian bisa langsung cek dokumentasinya:

https://elysiajs.com/patterns/websocket

Buat kalian yang menggunakan hono, konsep dasar dan cara Penggunaanya hampir mirip dengan elysia.

kalian bisa langsung explore websocket build in dari honojs :

https://hono.dev/docs/helpers/websocket

***EXPLORE :***
Ini tugas optional kalau kalian mau explore tools websocket yang lain dari bawaan elysia atau hono.

Socket.IO adalah sebuah library JavaScript untuk aplikasi web real-time. Socket.IO memungkinkan komunikasi dua arah secara real-time antara server web dan klien (browser). 
Pelajari dan explorasi pada library Socket.IO karena akan sangat berguna sekali pada development fullstack apps di phase 2 nanti, jika ada kebutuhan real time API.

https://socket.io/

# Studi Kasus Project Websocket menggunakan Bun + Elysia + Drizzle

Project ini adalah aplikasi chat real-time menggunakan teknologi:

1. **Bun** - JavaScript runtime yang cepat dan efisien, alternatif dari Node.js
2. **Elysia** - Framework web yang ringan dan cepat untuk Bun
3. **Drizzle** - ORM (Object-Relational Mapping) untuk database
4. **Neon** - Database PostgreSQL berbasis cloud

Aplikasi ini memungkinkan user untuk melakukan chat secara real-time menggunakan WebSocket, serta menyediakan REST API untuk interaksi dengan aplikasi.

## Fitur-fitur Utama:

1. Chat real-time melalui WebSocket
2. Penyimpanan pesan di database
3. Manajemen User (pembuatan User, pelacakan aktivitas)
4. REST API untuk berbagai operasi
5. Dokumentasi Swagger

## Flow Aplikasi

![image](https://github.com/user-attachments/assets/d974e525-8d9e-49cf-bd99-0d99e9fe96fa)

Berikut diagram alur (flow) dari aplikasi chat real-time ini:

### 1. Inisialisasi Aplikasi
- Aplikasi dimulai dengan menginisialisasi layanan: `ChatService` dan `UserService`
- Koneksi ke database Neon dibuat menggunakan Drizzle ORM
- Elysia menyiapkan endpoint HTTP dan WebSocket

### 2. Koneksi User
Ketika User terhubung ke aplikasi:
1. User mengakses aplikasi dan melakukan koneksi WebSocket ke `ws://localhost:3000/ws`
2. User mengirim pesan "join" dengan username mereka
3. Server:
   - Menciptakan/mengambil User dari database
   - Menambahkan koneksi WebSocket ke daftar User aktif
   - Mengirim pesan sambutan dan pesan-pesan terbaru ke User
   - Memberitahu User lain bahwa User baru telah bergabung

### 3. Pengiriman Pesan
Ketika User ingin mengirim pesan:
1. User mengirim pesan dengan format `{type: 'message', username: '...', content: '...'}`
2. Server:
   - Menyimpan pesan ke database melalui `ChatService`
   - Menyiarkan (broadcast) pesan ke semua User yang terhubung

### 4. User Keluar
Ketika User meninggalkan chat:
1. User mengirim pesan "leave" atau koneksi WebSocket terputus
2. Server:
   - Memperbarui waktu terakhir User terlihat di database
   - Menghapus User dari daftar User aktif
   - Memberitahu User lain bahwa User tersebut telah meninggalkan chat

## REST API Endpoints

Selain WebSocket, aplikasi juga menyediakan REST API:
- `GET /messages` - Mendapatkan pesan terbaru
- `POST /messages` - Mengirim pesan baru (akan disiarkan ke semua klien WebSocket)
- `GET /users/active` - Mendapatkan daftar User aktif
- `POST /users` - Membuat User baru
- `GET /ws-info` - Mendapatkan informasi tentang koneksi WebSocket

## Struktur Database

Database terdiri dari dua tabel utama:
1. `users` - Menyimpan informasi User (username, waktu terakhir terlihat)
2. `messages` - Menyimpan pesan chat (konten, User pengirim, waktu)

## Start Develop Simple Chat App

### 1. Setup project

seperti biasa kalian buat folder project untuk membuat ws app chat

```
mkdir ws-chat
cd ws-chat
bun init
```

lalu install library yang akan di gunakan
```
bun add elysiat drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit bun-types .env
```

lalu buatlah structur folder project seperti ini
```
ws-chat/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── messages.ts
│   │   │   ├── users.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   │   └── websocket.ts
│   ├── services/
│   │   ├── chat.service.ts
│   │   └── user.service.ts
│   └── index.ts
├── drizzle.config.ts
├── .env
└── package.json
```

### 2. Code

kalian bisa tiru code berikut dan di taruh ke dalam file yang sesuai

- src/db/schema/messages.ts
```js
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

import { users } from './users';

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});
```

- src/db/schema/users.ts
```js
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    lastSeen: timestamp('last_seen').defaultNow()
});
```

- src/db/schema/index.ts
```js

import { users } from './users';
import { messages } from './messages';

export {
    users,
    messages
};
```

- src/db/index.ts
```js
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
```

- src/services/chat.service.ts
```js
import { db } from '../db';
import { messages, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class ChatService {
    async getRecentMessages(limit: number = 50) {
        return await db.select({
            id: messages.id,
            content: messages.content,
            username: users.username,
            createdAt: messages.createdAt
        })
        .from(messages)
        .leftJoin(users, eq(messages.userId, users.id))
        .limit(limit)
        .execute();
    }

    async saveMessage(username: string, content: string) {
        // First find the user
        const user = await db.select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1)
            .execute();

        if (!user.length) return null;

        // Then save the message
        const result = await db.insert(messages)
            .values({
                content,
                userId: user[0].id
            })
            .returning()
            .execute();

        return {
            ...result[0],
            username
        };
    }
}
```

- src/services/user.service.ts
```js
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UserService {
    async createUser(username: string) {
        try {
            const result = await db.insert(users)
                .values({ username })
                .returning()
                .execute();
            return result[0];
        } catch (error) {
            // Handle unique constraint violation
            const existingUser = await db.select()
                .from(users)
                .where(eq(users.username, username))
                .limit(1)
                .execute();
            return existingUser[0];
        }
    }

    async updateLastSeen(username: string) {
        return await db.update(users)
            .set({ lastSeen: new Date() })
            .where(eq(users.username, username))
            .returning()
            .execute();
    }
}
```

- src/types/websocket.ts
```js
export interface ChatMessage {
  type: 'message' | 'join' | 'leave';
  username?: string;
  content?: string;
  timestamp?: Date;
}
```

- src/index.ts
```js
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';
import { staticPlugin } from '@elysiajs/static';

// Initialize services
const chatService = new ChatService();
const userService = new UserService();

// Track connected users
const connectedUsers = new Map<string, any>();

const app = new Elysia()
    .use(cors())
    // Configure Swagger with detailed documentation
    .use(swagger({
        documentation: {
            info: {
                title: 'Real-time Chat API',
                version: '1.0.0',
                description: 'API for real-time chat with both WebSocket and REST endpoints'
            },
            tags: [
                { name: 'Messages', description: 'Message operations' },
                { name: 'Users', description: 'User management' },
                { name: 'WebSocket', description: 'WebSocket connection info' }
            ]
        }
    }))
    // REST endpoint to get WebSocket connection details
    .get('/ws-info',
        () => ({
            websocketUrl: 'ws://localhost:3000/ws',
            messageFormats: {
                join: { type: 'join', username: 'string' },
                message: { type: 'message', username: 'string', content: 'string' },
                leave: { type: 'leave', username: 'string' }
            }
        }),
        {
            detail: {
                tags: ['WebSocket'],
                summary: 'Get WebSocket connection information',
                description: 'Returns WebSocket URL and message format examples'
            }
        }
    )
    // REST endpoint to get recent messages
    .get('/messages',
        async ({ query }) => {
            const limit = Number(query?.limit || 50);
            return await chatService.getRecentMessages(limit);
        },
        {
            query: t.Object({
                limit: t.Optional(t.Number({
                    default: 50,
                    minimum: 1,
                    maximum: 100
                }))
            }),
            detail: {
                tags: ['Messages'],
                summary: 'Get recent messages',
                description: 'Retrieve recent chat messages from the database'
            }
        }
    )
    // REST endpoint to send a message
    .post('/messages',
        async ({ body }) => {
            const message = await chatService.saveMessage(body.username, body.content);
            if (message) {
                broadcastMessage({
                    type: 'message',
                    username: body.username,
                    content: body.content,
                    timestamp: new Date()
                });
                return message;
            }
            throw new Error('Failed to save message');
        },
        {
            body: t.Object({
                username: t.String({
                    minLength: 1,
                    description: 'Username of the sender'
                }),
                content: t.String({
                    minLength: 1,
                    description: 'Message content'
                })
            }),
            detail: {
                tags: ['Messages'],
                summary: 'Send a new message',
                description: 'Send a message through REST API (will be broadcast to WebSocket clients)'
            }
        }
    )
    // REST endpoint to get active users
    .get('/users/active',
        () => Array.from(connectedUsers.keys()),
        {
            detail: {
                tags: ['Users'],
                summary: 'Get active users',
                description: 'List all currently connected users'
            }
        }
    )
    // REST endpoint to create a new user
    .post('/users',
        async ({ body }) => {
            return await userService.createUser(body.username);
        },
        {
            body: t.Object({
                username: t.String({
                    minLength: 1,
                    description: 'Username to register'
                })
            }),
            detail: {
                tags: ['Users'],
                summary: 'Register a new user',
                description: 'Create a new user in the system'
            }
        }
    )
    // WebSocket endpoint
    .ws('/ws', {
        message: async (ws, message: any) => {
            try {
                switch (message.type) {
                    case 'join':
                        const user = await userService.createUser(message.username);
                        if (user) {
                            connectedUsers.set(message.username, ws);
                            
                            // Send welcome message
                            ws.send({
                                type: 'system',
                                content: `Welcome ${message.username}!`,
                                timestamp: new Date()
                            });

                            // Load and send recent messages
                            const recentMessages = await chatService.getRecentMessages(10);
                            for (const msg of recentMessages) {
                                ws.send({
                                    type: 'message',
                                    username: msg.username,
                                    content: msg.content,
                                    timestamp: msg.createdAt
                                });
                            }

                            broadcastMessage({
                                type: 'system',
                                content: `${message.username} joined the chat`,
                                timestamp: new Date()
                            }, ws);
                        }
                        break;

                    case 'message':
                        if (message.content && message.username) {
                            const savedMessage = await chatService.saveMessage(
                                message.username,
                                message.content
                            );
                            if (savedMessage) {
                                broadcastMessage({
                                    type: 'message',
                                    username: message.username,
                                    content: message.content,
                                    timestamp: new Date()
                                });
                            }
                        }
                        break;

                    case 'leave':
                        if (message.username) {
                            await handleUserLeave(message.username);
                        }
                        break;
                }
            } catch (error) {
                console.error('WebSocket error:', error);
                ws.send({
                    type: 'error',
                    content: 'An error occurred processing your message'
                });
            }
        }
    })
    .listen(3000);

// Add this to your Elysia app configuration
app.use(staticPlugin())
.get('/test', () => Bun.file('./public/ws-tester.html'));


// Utility functions
function broadcastMessage(message: any, excludeWs?: any) {
    for (const [_, ws] of connectedUsers.entries()) {
        if (ws !== excludeWs) {
            ws.send(message);
        }
    }
}

async function handleUserLeave(username: string) {
    await userService.updateLastSeen(username);
    connectedUsers.delete(username);
    broadcastMessage({
        type: 'system',
        content: `${username} left the chat`,
        timestamp: new Date()
    });
}

console.log(`🚀 Server running at http://localhost:3000`);
console.log(`📚 Swagger documentation at http://localhost:3000/swagger`);
console.log(`🔌 WebSocket endpoint at ws://localhost:3000/ws`);

export type App = typeof app;
```

- ws-tester
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WebSocket Chat Tester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 0 20px;
        }
        .container {
            display: grid;
            gap: 20px;
        }
        .card {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
            background: #f9f9f9;
        }
        #messageLog {
            height: 300px;
            overflow-y: auto;
            border: 1px solid #ccc;
            padding: 10px;
            background: white;
            margin: 10px 0;
        }
        .message {
            margin: 5px 0;
            padding: 5px;
        }
        .system { color: #666; font-style: italic; }
        input, button {
            padding: 8px;
            margin: 5px 0;
        }
        input {
            width: 100%;
            box-sizing: border-box;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            padding: 10px 20px;
        }
        button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h2>Connection</h2>
            <input type="text" id="wsUrl" value="ws://localhost:3000/ws" placeholder="WebSocket URL">
            <input type="text" id="username" placeholder="Enter your username">
            <button onclick="connect()">Connect</button>
            <button onclick="disconnect()">Disconnect</button>
        </div>

        <div class="card">
            <h2>Send Message</h2>
            <input type="text" id="messageInput" placeholder="Type your message...">
            <button onclick="sendMessage()">Send</button>
        </div>

        <div class="card">
            <h2>Message Log</h2>
            <div id="messageLog"></div>
        </div>
    </div>

    <script>
        let ws;
        let username;

        function connect() {
            username = document.getElementById('username').value.trim();
            const url = document.getElementById('wsUrl').value;

            if (!username) {
                alert('Please enter a username');
                return;
            }

            ws = new WebSocket(url);

            ws.onopen = () => {
                addToLog('System', 'Connected to server');
                // Send join message
                ws.send(JSON.stringify({
                    type: 'join',
                    username: username
                }));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                addToLog(message.username || 'System', message.content);
            };

            ws.onclose = () => {
                addToLog('System', 'Disconnected from server');
            };

            ws.onerror = (error) => {
                addToLog('System', 'Error: ' + error.message);
            };
        }

        function disconnect() {
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'leave',
                    username: username
                }));
                ws.close();
            }
        }

        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const content = messageInput.value.trim();

            if (!content || !ws || ws.readyState !== WebSocket.OPEN) return;

            ws.send(JSON.stringify({
                type: 'message',
                username: username,
                content: content
            }));

            messageInput.value = '';
        }

        function addToLog(sender, content) {
            const log = document.getElementById('messageLog');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender === 'System' ? 'system' : ''}`;
            messageDiv.textContent = `${sender}: ${content}`;
            log.appendChild(messageDiv);
            log.scrollTop = log.scrollHeight;
        }

        // Allow sending message with Enter key
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
```
ini script untuk testing websocket dalam bentuk html nanti kalian akan bisa di jalankan di `http://localhost:3000/test`

- package.json
```json
{
  "name": "ws_chat",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@elysiajs/cors": "^1.1.1",
    "@elysiajs/static": "^1.1.1",
    "@elysiajs/websocket": "^0.2.8",
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.37.0",
    "elysia": "^1.1.26"
  },
  "devDependencies": {
    "@types/node": "^22.10.1",
    "bun-types": "latest",
    "dotenv": "^16.4.7",
    "drizzle-kit": "^0.29.1",
    "typescript": "^5.7.2",
    "@elysiajs/swagger": "^1.1.6"
  }
}
```

- drizzle.config.ts
```ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
    dialect: "postgresql",
    schema: './src/db/schema/*',
    out: './src/db/migrations',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
} satisfies Config;
```

### 3. .ENV and Running

1. buat file .env di dalam project mu dan masukan variable berikut
```
DATABASE_URL=postgres://your-username:your-password@your-neon-host/your-database
```
gunakan url neon database milik mu dengan cara buka website dan masuk

2. migration database
```
bun run db:generate
bun run db:push
```
pertama migrate terlebih dahulu schema databasenya lalu di buse ke dalam database, jika berhasil bisa di lihat pada table db neon kalian di website atau 

3. running and testing

setelah kalian run dengan `bun run dev` kalian bisa buka documentation di swagger `http://localhost:300/swagger` 
lalu untuk mencobanya pertama kalian buat user terlebih dahulu lalu ke api message dan coba api tersebut.


# Cara Testing Realtime

Untuk menguji aplikasi chat real-time ini, ikuti langkah-langkah berikut:

### 1. Testing dengan Browser
Aplikasi menyediakan halaman tester WebSocket yang bisa diakses di `http://localhost:3000/test`

### 2. Testing dengan Swagger
1. Buka dokumentasi Swagger di `http://localhost:3000/swagger`
2. Gunakan endpoint `/users` untuk membuat User baru
3. Uji endpoint `/messages` untuk mengirim dan mendapatkan pesan

### 3. Testing WebSocket dengan Tool Eksternal
Kalian juga bisa menggunakan alat seperti Postman atau WebSocket client lainnya:

1. Hubungkan ke `ws://localhost:3000/ws`
2. Kirim pesan bergabung:
   ```json
   {
     "type": "join",
     "username": "testuser123"
   }
   ```
3. Kirim pesan chat:
   ```json
   {
     "type": "message",
     "username": "testuser123",
     "content": "Halo semua!"
   }
   ```
4. Pantau respons server dan pesan dari User lain

### 4. Testing Simultan
Untuk menguji aspek real-time:
1. Buka beberapa jendela browser atau tab berbeda dan buka link ini `http://localhost:3000/test`
2. Jika sudah terbuka akan form seperti ini
   ![image](https://github.com/user-attachments/assets/62f1a35e-a5f0-4a30-969e-86d120625329)

4. Hubungkan masing-masing ke aplikasi dengan username berbeda
5. Kirim pesan dari satu klien dan verifikasi bahwa pesan tersebut muncul di semua klien lain secara instan pada message log
  ![image](https://github.com/user-attachments/assets/21672929-0bf5-4c46-a56d-7c4aaa07521f)


### 5. Testing Fitur Khusus
- Coba hubungkan beberapa User dan kirim pesan antar mereka
- Verifikasi bahwa pesan disimpan di database (bisa dicek melalui endpoint GET /messages)
- Coba User keluar dan masuk kembali untuk memverifikasi pesan riwayat

Dengan langkah-langkah ini, Kalian dapat memverifikasi bahwa aplikasi chat berfungsi dengan baik secara real-time, pesan disimpan dengan benar, dan komunikasi antar User berjalan lancar.
