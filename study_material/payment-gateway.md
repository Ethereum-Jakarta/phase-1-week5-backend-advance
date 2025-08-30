# Payment Gateway (Stripe)

pada part ini kalian akan belajar tentang payment gateway menggunakan stripe. kalian akan membuat sebuah simple project yaitu `room booking backend` tetapi sebelum kalian mulai studi kasus ini kami akan menjelaskan sedikit tentang materi part init

## Payment Gateway

### 1. Apa itu Payment Gateway?
Payment Gateway adalah layanan yang menghubungkan toko online atau bisnis dengan sistem perbankan untuk memproses pembayaran. Ini adalah "jembatan" yang memungkinkan pelanggan melakukan pembayaran secara aman menggunakan berbagai metode seperti kartu kredit, debit, e-wallet, atau transfer bank.

### 2. Mengapa Payment Gateway Penting?
- **Keamanan**: Melindungi data pembayaran pelanggan dengan enkripsi.
- **Efisiensi**: Memproses pembayaran secara cepat dan otomatis.
- **Global Reach**: Memungkinkan pembayaran lintas negara dan mata uang.
- **Kemudahan**: Memberikan pengalaman pengguna yang nyaman dalam transaksi online.

### 3. Cara Kerja Payment Gateway

1. Pelanggan Bertransaksi:
- Pelanggan memilih produk/jasa di website atau aplikasi.
- Pelanggan memasukkan informasi pembayaran, seperti kartu kredit atau dompet digital.

2. Enkripsi Data:
- Payment gateway mengenkripsi data sensitif (seperti nomor kartu) untuk mencegah pencurian data.

3. Validasi dan Otorisasi:
- Data pembayaran dikirim ke bank penerbit (issuer) untuk diverifikasi.
- Jika valid, bank mengotorisasi transaksi.

4. Konfirmasi Pembayaran:
- Payment gateway mengirimkan notifikasi ke pelanggan dan bisnis bahwa pembayaran berhasil.

5. Transfer Dana:
- Uang dari pelanggan ditransfer ke rekening bisnis setelah diproses.

### 4. Contoh Payment Gateway Populer
- **Stripe**: Mudah diintegrasikan, mendukung banyak metode pembayaran.
- **PayPal**: Populer untuk transaksi global.
- **Razorpay**: Fokus pada pasar Asia.
- **Midtrans**: Banyak digunakan di Indonesia.
- **Square**: Cocok untuk bisnis kecil.

## Stripe

### 1. Apa itu Stripe?
Stripe adalah platform teknologi finansial yang menyediakan solusi pembayaran online. Stripe memungkinkan bisnis menerima pembayaran dari berbagai metode, termasuk kartu kredit, debit, dan dompet digital. Stripe sering digunakan karena kemudahan integrasi, dukungan lintas negara, dan fitur-fiturnya yang lengkap.

### 2. Fitur Utama Stripe
- **Pembayaran Online**: Mendukung berbagai metode pembayaran global.
- **Keamanan**: Dilengkapi dengan PCI DSS Level 1 Certification.
- **Integrasi Mudah**: Library dan API tersedia untuk banyak bahasa pemrograman.
- **Dashboard**: Untuk memantau transaksi secara real-time.
- **Custom Checkout**: Menyesuaikan halaman pembayaran agar sesuai dengan brand.

### 3. Cara Kerja Stripe
- **Pelanggan Melakukan Pembayaran**: Pelanggan memasukkan informasi pembayaran.
- **Stripe Memproses Pembayaran**: Stripe mengamankan data, memverifikasi kartu, dan memproses transaksi.
- **Konfirmasi Pembayaran**: Stripe mengirimkan status pembayaran kembali ke aplikasi.
- **Payout ke Merchant**: Stripe mentransfer dana ke rekening merchant.


# Studi Kasus (Room booking)
Kali ini kalian akan mempelajari langsung dengan membuat sebuah backend project pemesanan ruangan dengan mengimplementasikan payment gateway
menggunakan stripe.

## 1. Project Overview

sebelum kalian membuat programnya mari kita bahas tentang project yg akan kita buat secara singkat

berikut adalah Architecture 
```
+------------------------------------------+
|              Client Side                  |
|  (Web Browser / API Consumers)           |
+------------------------------------------+
                   ↕
+------------------------------------------+
|           Elysia.js Server               |
|------------------------------------------|
|    Controllers Layer                      |
|  +----------------+-------------------+   |
|  |  Room         |  Customer         |   |
|  |  Controller   |  Controller       |   |
|  +----------------+-------------------+   |
|  |  Booking      |  Payment          |   |
|  |  Controller   |  Controller       |   |
|  +----------------+-------------------+   |
|------------------------------------------|
|    Services Layer                         |
|  +----------------+-------------------+   |
|  |  Room         |  Customer         |   |
|  |  Service      |  Service          |   |
|  +----------------+-------------------+   |
|  |  Booking      |  Payment          |   |
|  |  Service      |  Service          |   |
|  +----------------+-------------------+   |
+------------------------------------------+
                   ↕
+------------------------------------------+
|            External Services              |
|  +----------------+-------------------+   |
|  |    Stripe     |     Neon DB       |   |
|  |    Payment    |   (PostgreSQL)    |   |
|  +----------------+-------------------+   |
+------------------------------------------+
                   ↕
+------------------------------------------+
|            Database Schema                |
|  +----------------+-------------------+   |
|  |    Rooms      |    Customers      |   |
|  |    Table      |    Table          |   |
|  +----------------+-------------------+   |
|  |   Bookings    |    Facilities     |   |
|  |    Table      |    Table          |   |
|  +----------------+-------------------+   |
+------------------------------------------+
```

seperti yang kalian lihat pada Architecture  di atas kita akan memakai teknologi berikut:

1. **Elysia**: untuk membuat client server kalian akan menggunakan elysia seperti part2 sebelumnya
2. **Neon DB**: kita akan menggunakan cloud Neon DB sebagai database pada project kali ini
3. **Stripe**: untuk Payment kalian akan menggunakan stripe karna mudah untuk membuat akunnya

lalu kita akan membuat 4 service layer yaitu:
- **Room Service**: Service untuk pengelolaan Ruangan
- **Customer Service**: Untuk Mengelola data2 Customer
- **Booking Service**: Untuk Pemesanan ruangan dsb
- **Payment Service**: Service untuk melakukan pembayaran

kemudian schemanya table seperti diatas ada 4 yaitu: 
- **Rooms Table**: tabel untuk data ruangan
- **Customers Table**: tabel untuk setiap pelanggan yang memesan ruangan
- **Bookings Table**: tabel untuk menyimpan pemesanan yang di lakukan
- **Facilities Table**: table untuk jenis2 list fasilitas yang ada di ruangan

mari kita mulai pembuatan project ini.

## Write the code
mari sekarang kita mulai pembuatan project mulai dari setup, pembuatan service, controller, migration database, dan payment gateway interaction.

dan ini bentuk folder project struktur kita nanti
```
hotel-booking/
├── src/
│   ├── config/
│   │   ├── database.ts        # Database configuration
│   │   └── stripe.ts         # Stripe configuration
│   │
│   ├── controllers/
│   │   ├── roomController.ts
│   │   ├── customerController.ts 
│   │   ├── bookingController.ts
│   │   ├── paymentController.ts
│   │   └── webhookController.ts
│   │
│   ├── services/
│   │   ├── roomService.ts
│   │   ├── customerService.ts
│   │   ├── bookingService.ts
│   │   └── paymentService.ts
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   └── schema.ts         # Database schema definitions
│   │
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   │
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   └── validators.ts
│   │
│   ├── swagger/
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── paths/
│   │   │   ├── room.ts
│   │   │   ├── booking.ts 
│   │   │   ├── customer.ts
│   │   │   └── payment.ts
│   │   └── schemas/
│   │       ├── room.ts
│   │       ├── booking.ts
│   │       └── customer.ts
│   │
│   └── index.ts              # Main application entry
│
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── drizzle.config.ts        # Drizzle ORM config
└── README.md
```
mari kita mulai

### 1. Setup
pertama kita setup project kita dari awal dengan membuat project elysia dan menginstalasi package yang akan kita butuhkan

```
bun create elysia rpn-hotel-booking
cd rpn-hotel-booking
bun add @elysiajs/cors @elysiajs/swagger stripe @neondatabase/serverless
```

atau kalian bisa menggunakan `package.json` seperti ini
```json
{
  "name": "rpn-hotel-booking",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@elysiajs/cors": "^1.2.0",
    "@elysiajs/swagger": "^1.2.0",
    "@neondatabase/serverless": "^0.10.4",
    "dotenv": "^16.4.7",
    "drizzle-orm": "^0.38.3",
    "elysia": "latest",
    "pg": "^8.13.1",
    "postgres": "^3.4.5",
    "stripe": "^17.5.0"
  },
  "devDependencies": {
    "@types/pg": "^8.11.10",
    "bun-types": "latest",
    "drizzle-kit": "^0.30.1"
  },
  "module": "src/index.js"
}
```

lalu untuk setting `drizzle.config.ts`
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
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config
```

kemudian instalasi stripe secara global untuk mendapatkan link webhook nantinya. 
dan pastikansudah mempunyai akun stripe, jika belum maka tinggal di buat di website [stripe](https://stripe.com/)
```
choco install stripe-cli

# Then login and start forwarding:
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

ketika kalian sudah sampai me listen webhooknya kalian akan mendapatkan stripe webhook secret
dan taruh ke dalam STRIPE_WEBHOOK_SECRET di `.env` kalian

- `.env`

```env
DATABASE_URL=
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec_....
SUCCESS_URL=http://localhost:3000/success
CANCEL_URL=http://localhost:3000/cancel
```

setelah kita siapkan mari kita lanjut ke code lainnya

### 2. Config

kita set config untuk databse dan stripenya

```ts
// src/config/database.ts
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;
export const sql = neon(process.env.DATABASE_URL!);
```

```ts
// src/config/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### 3. db

setelah kalian setingng confignya lalu buat schema nya 

```ts
// src/db/schema.ts
import { pgTable, uuid, varchar, timestamp, decimal, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const facilities = pgTable('facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  capacity: decimal('capacity').notNull(),
  facilities: jsonb('facilities').notNull(),
  isAvailable: boolean('is_available').default(true),
  roomNumber: varchar('room_number', { length: 50 }).notNull(),
  floorNumber: varchar('floor_number', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  address: varchar('address', { length: 1000 }),
  idNumber: varchar('id_number', { length: 100 }),
  idType: varchar('id_type', { length: 50 }), // passport, national id, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id).notNull(),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestEmail: varchar('guest_email', { length: 255 }).notNull(),
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  numberOfGuests: integer('number_of_guests').notNull(),
  specialRequests: varchar('special_requests', { length: 1000 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

```ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### 4. services

kalian buat service sama seperti yang kita briefing di atas

- bookingService.ts
```ts
// src/services/bookingService.ts
import { eq, and, or, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { bookings } from '../db/schema';
import { RoomService } from './roomService';
import { CustomerService } from './customerService';
import { stripe } from '../config/stripe';
import type { BookingRequestSchema, Booking } from '../types';

export class BookingService {
  private roomService: RoomService;
  private customerService: CustomerService;

  constructor() {
    this.roomService = new RoomService();
    this.customerService = new CustomerService();
  }

  async checkAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, roomId),
          or(
            and(
              gte(bookings.checkIn, checkIn),
              lte(bookings.checkIn, checkOut)
            ),
            and(
              gte(bookings.checkOut, checkIn),
              lte(bookings.checkOut, checkOut)
            )
          )
        )
      );

    return existingBookings.length === 0;
  }

  async createBooking(data: {
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    checkIn: string;
    checkOut: string;
    numberOfGuests: number;
    specialRequests?: string;
  }): Promise<any> {
    try {
      // First, create or update customer record
      const customer = await this.customerService.createOrUpdateCustomer({
        name: data.guestName,
        email: data.guestEmail,
        phone: data.guestPhone
      });

      // Get room details
      const room = await this.roomService.getRoomById(data.roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check room availability
      const isAvailable = await this.checkAvailability(
        data.roomId,
        new Date(data.checkIn),
        new Date(data.checkOut)
      );
      if (!isAvailable) {
        throw new Error('Room is not available for selected dates');
      }

      // Calculate total price
      const nights = this.calculateNights(data.checkIn, data.checkOut);
      const totalPrice = parseFloat(room.pricePerNight) * nights;

      // Create Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(totalPrice * 100),
            product_data: {
              name: room.name,
              description: `${nights} night(s) stay from ${data.checkIn} to ${data.checkOut}`
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.CANCEL_URL,
        customer_email: data.guestEmail,
        metadata: {
          customerId: customer.id,
          roomId: room.id
        }
      });

      // Create booking record
      const [booking] = await db
        .insert(bookings)
        // @ts-ignore
        .values({
          roomId: data.roomId,
          customerId: customer.id, // Add customer ID reference
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          checkIn: new Date(data.checkIn),
          checkOut: new Date(data.checkOut),
          totalPrice,
          numberOfGuests: data.numberOfGuests,
          specialRequests: data.specialRequests,
          stripeSessionId: session.id,
          paymentStatus: 'pending'
        })
        .returning();

      return {
        booking: {
          ...booking,
          customer
        },
        checkoutUrl: session.url
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  async updatePaymentStatus(sessionId: string, status: 'paid' | 'failed'): Promise<void> {
    try {
      console.log(`Updating payment status for session ${sessionId} to ${status}`);
      
      // Verify the payment with Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        throw new Error('Invalid session ID');
      }

      // Update the booking status
      const [updatedBooking] = await db
        .update(bookings)
        .set({ 
          paymentStatus: status,
          updatedAt: new Date()
        })
        .where(eq(bookings.stripeSessionId, sessionId))
        .returning();

      console.log('Updated booking:', updatedBooking);

      if (!updatedBooking) {
        throw new Error('Booking not found for this session');
      }

      // Here you could add additional success actions like:
      if (status === 'paid') {
        // Send confirmation email
        // Update room availability
        // Send notification to hotel staff
        console.log(`Payment completed for booking ${updatedBooking.id}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Add method to check booking status
  async getBookingStatus(bookingId: string) {
    try {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        throw new Error('Booking not found');
      }

      return {
        id: booking.id,
        paymentStatus: booking.paymentStatus,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestName: booking.guestName,
        totalPrice: booking.totalPrice
      };
    } catch (error: any) {
      console.error('Error getting booking status:', error);
      throw new Error(`Failed to get booking status: ${error.message}`);
    }
  }

  async getOrCreatePaymentLink(bookingId: string): Promise<string> {
    try {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.paymentStatus === 'paid') {
        throw new Error('Booking is already paid');
      }

      const room = await this.roomService.getRoomById(booking.roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Create new Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(parseFloat(booking.totalPrice) * 100),
            product_data: {
              name: room.name,
              description: `Booking for ${booking.guestName}`
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.CANCEL_URL,
        customer_email: booking.guestEmail,
      });

      // Update booking with new session ID
      await db
        .update(bookings)
        .set({ stripeSessionId: session.id })
        .where(eq(bookings.id, bookingId));

      return session.url!;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  async handleFailedPayment(sessionId: string, reason: 'cancelled' | 'failed'): Promise<void> {
    try {
      const [booking] = await db
        .update(bookings)
        .set({ 
          paymentStatus: reason,
          updatedAt: new Date()
        })
        .where(eq(bookings.stripeSessionId, sessionId))
        .returning();

      if (!booking) {
        throw new Error('Booking not found for this session');
      }

      // Release the room dates back to availability
      await this.roomService.updateRoomAvailability(booking.roomId, true);

      // You might want to notify the customer
      // await this.sendPaymentFailureNotification(booking);
    } catch (error) {
      console.error(`Error handling ${reason} payment:`, error);
      throw error;
    }
  }

  async retryPayment(bookingId: string): Promise<{ checkoutUrl: string }> {
    try {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.paymentStatus === 'paid') {
        throw new Error('Booking is already paid');
      }

      // Check if the dates are still available
      const isAvailable = await this.checkAvailability(
        booking.roomId,
        booking.checkIn,
        booking.checkOut
      );

      if (!isAvailable) {
        throw new Error('Room is no longer available for these dates');
      }

      // Create new Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(parseFloat(booking.totalPrice) * 100),
            product_data: {
              name: `Booking Retry - ${booking.guestName}`,
              description: `Booking from ${booking.checkIn} to ${booking.checkOut}`
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.CANCEL_URL,
        customer_email: booking.guestEmail,
      });

      // Update booking with new session ID
      await db
        .update(bookings)
        .set({ 
          stripeSessionId: session.id,
          paymentStatus: 'pending',
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));

      return { checkoutUrl: session.url! };
    } catch (error) {
      console.error('Error retrying payment:', error);
      throw error;
    }
  }

  async getAllBookings(options?: {
    status?: 'pending' | 'paid' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: Booking[]; total: number }> {
    try {
      let query: any = db.select().from(bookings);

      // Add status filter if provided
      if (options?.status) {
        query = query.where(eq(bookings.paymentStatus, options.status));
      }

      // Add pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.offset(options.offset);
      }

      // Order by created date
      query = query.orderBy(desc(bookings.createdAt));

      const result = await query;

      return {
        bookings: result,
        total: result.length
      };
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  async getBookingsByCustomerEmail(email: string): Promise<Booking[]> {
    try {
      const customerBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.guestEmail, email))
        .orderBy(desc(bookings.createdAt));

      return customerBookings;
    } catch (error) {
      console.error('Error getting customer bookings:', error);
      throw error;
    }
  }

  async getBookingsByRoomId(roomId: string): Promise<Booking[]> {
    try {
      const roomBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.roomId, roomId))
        .orderBy(desc(bookings.createdAt));

      return roomBookings;
    } catch (error) {
      console.error('Error getting room bookings:', error);
      throw error;
    }
  }

  async getBookingStats(): Promise<any> {
    try {
      // Get counts by status
      const statusCounts = await db
        .select({
          status: bookings.paymentStatus,
          count: sql<number>`count(*)`
        })
        .from(bookings)
        .groupBy(bookings.paymentStatus);

      // Get total revenue from paid bookings
      const [revenue] = await db
        .select({
          total: sql<number>`sum(total_price)`
        })
        .from(bookings)
        .where(eq(bookings.paymentStatus, 'paid'));

      return {
        statusCounts,
        totalRevenue: revenue?.total || 0
      };
    } catch (error) {
      console.error('Error getting booking stats:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      // Get booking details
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if booking can be cancelled
      if (booking.paymentStatus === 'paid') {
        // If paid, we might want to process refund through Stripe
        if (booking.stripeSessionId) {
          // Get stripe session
          const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
          
          // If payment was successful, create refund
          if (session.payment_status === 'paid') {
            const paymentIntentId = session.payment_intent as string;
            await stripe.refunds.create({
              payment_intent: paymentIntentId,
              reason: 'requested_by_customer'
            });
          }
        }
      }

      // Update booking status
      await db
        .update(bookings)
        .set({ 
          paymentStatus: 'cancelled',
          updatedAt: new Date(),
          // @ts-ignore
          cancellationReason: reason || 'Customer requested cancellation'
        })
        .where(eq(bookings.id, bookingId));

      // Release room availability
      if (booking.roomId) {
        await this.roomService.updateRoomAvailability(booking.roomId, true);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

}
```

- customerService.ts
```ts
// src/services/customerService.ts
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { customers } from '../db/schema';
import type { Customer } from '../types';

export class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    idNumber?: string;
    idType?: string;
  }): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(data)
      .returning();
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));
    return customer;
  }

  async createOrUpdateCustomer(data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Customer> {
    try {
      // Check if customer exists
      const [existingCustomer] = await db
        .select()
        .from(customers)
        .where(eq(customers.email, data.email));

      if (existingCustomer) {
        // Update existing customer
        const [updatedCustomer] = await db
          .update(customers)
          .set({
            name: data.name,
            phone: data.phone,
            updatedAt: new Date()
          })
          .where(eq(customers.id, existingCustomer.id))
          .returning();

        return updatedCustomer;
      }

      // Create new customer
      const [newCustomer] = await db
        .insert(customers)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone
        })
        .returning();

      return newCustomer;
    } catch (error: any) {
      console.error('Error creating/updating customer:', error);
      throw new Error(`Failed to manage customer record: ${error.message}`);
    }
  }
}
```


- facilitService.ts
```ts
// src/services/facilityService.ts
import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { facilities } from '../db/schema';
import type { Facility } from '../types';

export class FacilityService {
  async getAllFacilities(): Promise<Facility[]> {
    return await db.select().from(facilities);
  }

  async getFacilityById(id: string): Promise<Facility | undefined> {
    const [facility] = await db
      .select()
      .from(facilities)
      .where(eq(facilities.id, id));
    return facility;
  }

  async createFacility(data: { name: string; description?: string }): Promise<Facility> {
    const [facility] = await db
      .insert(facilities)
      .values(data)
      .returning();
    return facility;
  }

  async getFacilitiesByIds(ids: string[]): Promise<Facility[]> {
    try {
      const facilityList = await db
        .select()
        .from(facilities)
        .where(sql`${facilities.id} IN ${ids}`);
      return facilityList;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw new Error('Failed to fetch facilities');
    }
  }
}
```

- roomService.ts

```ts
// src/services/roomService.ts
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { rooms } from '../db/schema';
import { FacilityService } from './facilityService';
import type { Room } from '../types';

export class RoomService {
  private facilityService: FacilityService;

  constructor() {
    this.facilityService = new FacilityService();
  }

  async createRoom(data: {
    name: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    facilityIds: string[];
    roomNumber: string;
    floorNumber: string;
  }): Promise<Room> {
    try {
      // Get facility details
      let facilityDetails = [];
      if (data.facilityIds && data.facilityIds.length > 0) {
        const facilities = await this.facilityService.getFacilitiesByIds(data.facilityIds);
        facilityDetails = facilities.map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description
        }));
      }

      // Create room with facilities
      const [room] = await db
        .insert(rooms)
        .values({
          name: data.name,
          description: data.description,
          pricePerNight: data.pricePerNight,
          capacity: data.capacity,
          roomNumber: data.roomNumber,
          floorNumber: data.floorNumber,
          facilities: facilityDetails, // Store facility details in JSONB
          isAvailable: true
        })
        .returning();

      return room;
    } catch (error: any) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async getAllRooms(): Promise<Room[]> {
    try {
      return await db.select().from(rooms);
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch rooms from database');
    }
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    try {
      const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, id));
      return room;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch room from database');
    }
  }

  async updateRoomAvailability(id: string, isAvailable: boolean): Promise<Room | undefined> {
    const [room] = await db
      .update(rooms)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }
}
```

### 5. Controllers
setelah membuat service mari kita buat controller untuk para service tady termasuk untuk payment gateway
dan webhooknya 

- bookingController.ts

```ts
// src/controllers/bookingController.ts
import { Elysia, t } from 'elysia';
import { BookingService } from '../services/bookingService';
import { BookingRequestSchema } from '../types';

export const bookingController = new Elysia({ prefix: '/api/bookings' })
  .decorate('bookingService', new BookingService())
  .post('/check-availability', async ({ body, bookingService }) => {
    const isAvailable = await bookingService.checkAvailability(
      body.roomId,
      new Date(body.checkIn),
      new Date(body.checkOut)
    );
    return { available: isAvailable };
  }, {
    body: t.Object({
      roomId: t.String(),
      checkIn: t.String(),
      checkOut: t.String()
    })
  })
  .post('/', async ({ body, bookingService }) => {
    try {
      const booking = await bookingService.createBooking(body);
      return {
        status: 'success',
        data: booking
      };
    } catch (error: any) {
      console.error('Booking error:', error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }, {
    body: BookingRequestSchema
  })
  .get('/:id/status', async ({ params: { id }, bookingService }) => {
    try {
      const status = await bookingService.getBookingStatus(id);
      return {
        status: 'success',
        data: status
      };
    } catch (error: any) {
      throw new Error(`Failed to get booking status: ${error.message}`);
    }
  })
  .get('/:id/payment-link', async ({ params: { id }, bookingService }) => {
    try {
      const checkoutUrl = await bookingService.getOrCreatePaymentLink(id);
      return {
        status: 'success',
        data: { checkoutUrl }
      };
    } catch (error: any) {
      throw new Error(`Failed to get payment link: ${error.message}`);
    }
  })
  .post('/:id/retry-payment', async ({ params: { id }, bookingService }) => {
    try {
      const result = await bookingService.retryPayment(id);
      return {
        status: 'success',
        data: result
      };
    } catch (error: any) {
      throw new Error(`Failed to retry payment: ${error.message}`);
    }
  })

  // Get all bookings with pagination and filters
  .get('/', async ({ query, bookingService }) => {
    try {
      const { status, limit, offset } = query;
      const bookings = await bookingService.getAllBookings({
        status: status as any,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
      });
      return {
        status: 'success',
        data: bookings
      };
    } catch (error: any) {
      throw new Error(`Failed to get bookings: ${error.message}`);
    }
  }, {
    query: t.Object({
      status: t.Optional(t.Union([
        t.Literal('pending'),
        t.Literal('paid'),
        t.Literal('failed'),
        t.Literal('cancelled')
      ])),
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String())
    })
  })

  // Get bookings by customer email
  .get('/customer/:email', async ({ params: { email }, bookingService }) => {
    try {
      const bookings = await bookingService.getBookingsByCustomerEmail(email);
      return {
        status: 'success',
        data: bookings
      };
    } catch (error: any) {
      throw new Error(`Failed to get customer bookings: ${error.message}`);
    }
  })

  // Get bookings by room
  .get('/room/:roomId', async ({ params: { roomId }, bookingService }) => {
    try {
      const bookings = await bookingService.getBookingsByRoomId(roomId);
      return {
        status: 'success',
        data: bookings
      };
    } catch (error: any) {
      throw new Error(`Failed to get room bookings: ${error.message}`);
    }
  })

  // Get booking statistics
  .get('/stats', async ({ bookingService }) => {
    try {
      const stats = await bookingService.getBookingStats();
      return {
        status: 'success',
        data: stats
      };
    } catch (error: any) {
      throw new Error(`Failed to get booking stats: ${error.message}`);
    }
  })

  .post('/:id/cancel', async ({ params: { id }, body, bookingService }) => {
    try {
      await bookingService.cancelBooking(id, body.reason);
      return {
        status: 'success',
        message: 'Booking cancelled successfully'
      };
    } catch (error: any) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }, {
    body: t.Object({
      reason: t.Optional(t.String())
    })
  });
```

- customerController.ts

```ts
// src/controllers/customerController.ts
import { Elysia, t } from 'elysia';
import { CustomerService } from '../services/customerService';
import { CustomerSchema, CreateCustomerSchema } from '../types';

export const customerController = new Elysia({ prefix: '/api/customers' })
  .decorate('customerService', new CustomerService())
  .get('/', async ({ customerService }) => {
    return await customerService.getAllCustomers();
  }, {
    response: t.Array(CustomerSchema)
  })
  .get('/:id', async ({ params: { id }, customerService }) => {
    const customer = await customerService.getCustomerById(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }, {
    response: CustomerSchema
  })
  .post('/', async ({ body, customerService }) => {
    const existingCustomer = await customerService.getCustomerByEmail(body.email);
    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }
    return await customerService.createCustomer(body);
  }, {
    body: CreateCustomerSchema,
    response: CustomerSchema
  });

```

- facilityController.ts

```ts
// src/controllers/facilityController.ts
import { Elysia, t } from 'elysia';
import { FacilityService } from '../services/facilityService';
import { FacilitySchema } from '../types';

export const facilityController = new Elysia({ prefix: '/api/facilities' })
  .decorate('facilityService', new FacilityService())
  .get('/', async ({ facilityService }) => {
    return await facilityService.getAllFacilities();
  }, {
    response: t.Array(FacilitySchema)
  })
  .post('/', async ({ body, facilityService }) => {
    return await facilityService.createFacility(body);
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String())
    }),
    response: FacilitySchema
  });
```

- paymentController.ts

```ts
// src/controllers/paymentController.ts
import { Elysia, t } from 'elysia';
import { BookingService } from '../services/bookingService';

export const paymentController = new Elysia()
  .get('/success', async ({ query }) => {
    try {
      const sessionId = query.session_id;
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const bookingService = new BookingService();
      await bookingService.updatePaymentStatus(sessionId, 'paid');

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
        const bookingService = new BookingService();
        await bookingService.handleFailedPayment(sessionId, 'cancelled');
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

- roomController

```ts
// src/controllers/roomController.ts
import { Elysia, t } from 'elysia';
import { RoomService } from '../services/roomService';
import { RoomSchema, CreateRoomSchema } from '../types';

const RoomResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  pricePerNight: t.Number(),
  capacity: t.Number(),
  roomNumber: t.String(),
  floorNumber: t.String(),
  facilities: t.Array(t.Any()),
  isAvailable: t.Boolean(),
  createdAt: t.Any(),
  updatedAt: t.Any()
});

const createRoomBody = t.Object({
  name: t.String(),
  description: t.String(),
  pricePerNight: t.Union([t.String(), t.Number()]), // Accept both string and number
  capacity: t.Union([t.String(), t.Number()]), // Accept both string and number
  facilityIds: t.Array(t.String()),
  roomNumber: t.String(),
  floorNumber: t.String()
});

export const roomController = new Elysia({ prefix: '/api/rooms' })
  .decorate('roomService', new RoomService())
  .get('/', async ({ roomService }) => {
    try {
      const rooms = await roomService.getAllRooms();
      return { status: 'success', data: rooms };
    } catch (error: any) {
      console.error('Error getting rooms:', error);
      throw new Error('Failed to fetch rooms');
    }
  })
  .get('/:id', async ({ params: { id }, roomService }) => {
    try {
      const room = await roomService.getRoomById(id);
      if (!room) {
        throw new Error('Room not found');
      }
      return { status: 'success', data: room };
    } catch (error: any) {
      console.error('Error getting room:', error);
      throw new Error(`Failed to fetch room: ${error.message}`);
    }
  })
  .post('/', async ({ body, roomService }) => {
    try {
      // Convert string values to numbers
      const processedBody = {
        ...body,
        pricePerNight: Number(body.pricePerNight),
        capacity: Number(body.capacity)
      };

      // Validate the numbers
      if (isNaN(processedBody.pricePerNight)) {
        throw new Error('Invalid price per night');
      }
      if (isNaN(processedBody.capacity)) {
        throw new Error('Invalid capacity');
      }

      const room = await roomService.createRoom(processedBody);
      return {
        status: 'success',
        data: room
      };
    } catch (error: any) {
      console.error('Controller error:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }, {
    body: createRoomBody
  })
  .patch('/:id/availability', async ({ params: { id }, body, roomService }: any) => {
    const room = await roomService.updateRoomAvailability(id, body.isAvailable);
    if (!room) throw new Error('Room not found');
    return room;
  }, {
    body: t.Object({
      isAvailable: t.Boolean()
    }),
    response: RoomSchema
  });
```

- webhookController.ts

```ts
// src/controllers/webhookController.ts
import { Elysia } from 'elysia';
import { stripe } from '../config/stripe';
import { BookingService } from '../services/bookingService';

export const webhookController = new Elysia()
  .post('/api/webhook', async ({ request }) => {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('No signature provided');
    }

    try {
      const payload = await request.text();
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      const bookingService = new BookingService();

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await bookingService.updatePaymentStatus(session.id, 'paid');
          break;
        }
        case 'checkout.session.expired': {
          const session = event.data.object;
          await bookingService.handleFailedPayment(session.id, 'failed');
          break;
        }
        case 'checkout.session.async_payment_failed': {
          const session = event.data.object;
          await bookingService.handleFailedPayment(session.id, 'failed');
          break;
        }
      }

      return { received: true };
    } catch (err: any) {
      console.error('Webhook error:', err);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  });
```

### Finishing & Running

sisanya kita tinggal menulis file index nya dan me-running code nya

```ts
// Update src/index.ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import swaggers from './swaggers';
import { roomController } from './controllers/roomController';
import { customerController } from './controllers/customerController';
import { bookingController } from './controllers/bookingController';
import { facilityController } from './controllers/facilityController';
import { paymentController } from './controllers/paymentController';

const app = new Elysia()
  .use(cors())
  // .use(swagger({ documentation: swaggers }))
  .use(roomController)
  .use(customerController)
  .use(bookingController)
  .use(facilityController)
  .use(paymentController)
  .listen(process.env.PORT || 3000);

console.log(`
🏨 Hotel Booking API is running!
📚 API Documentation: http://localhost:${process.env.PORT || 3000}/swagger
`);
```

sebelum kalian runing jangan lupa untuk generate dan push schema db kalian ke database

```
## Generate
bun run db:generate
// atau
drizzle-kit generate

// lalu push schema ke Database
bun run db:push
// atau
drizzle-kit push
```

lalu kalian tinggal me running projectnya

```
bun run dev
```

jika berjalan mari kita test dengan menggunakan dokumentasi swagger `http://localhost:3000/swagger`

1. buat sebuah fasility data untuk menambahkan fasility yang ada di ruangan yang akan kita buat nanti

![image](https://github.com/user-attachments/assets/6ee2b009-d107-4363-9ffc-f9e10169ec8d)


2. buat sebuah data ruangan menggunakan service dari roomService dan jangan lupa masukan fasility id nya

![image](https://github.com/user-attachments/assets/9190f31d-7249-4f14-9313-c65f4638225b)

3. jalankan service booking. jika kalian berhasil membuat pemesanan ruangan maka kalian akan mendapatkan link stripe seperti ini

![image](https://github.com/user-attachments/assets/36e13f7f-e5d9-48ab-8514-0c4ac9d0ebb4)


```
"checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1XWu5n6MSWIWugnRUcSzTLSauxwzR7rkz7YwJUQB1tu3YRWpqoNW9ww5h#fidkdWxOYHwnPyd1blpxYHZxWjA0VGdpTE01M1BqPEs0RFRkfFc9ZEt9STB0aDExbFZzMn9sNzdvU0tCalF%2FREpQTXFjaGRMVU51fEZfMklhMWExXWlJTVVoYEBrVkxPQV1hUFVkS1NifXdyNTVAMGYxTkR2cCcpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl"
```

jika kalian mendapatkan link tersebut kalian tinggal masuk ke halaman lalu lakukan pembayaran

![image](https://github.com/user-attachments/assets/6cff5d8c-b596-4286-9b28-4da8c3a3b7ed)

dan jika paymen berhasil akan masu ke link `localhost:3000/success` seperti yang kita atur untuk webhooknya

![image](https://github.com/user-attachments/assets/0ae93147-2945-465a-bd3c-a244d589224d)


***NOTICE: UNTUK KASUS SEKARANG KITA MENGGUNAKAN SANDBOX JADI TIDAK PERLU MENGGUNAKAN KARTU KREDIT ASLI KALIAN UNTUK MENGETESTNYA***

lalu jika sudah kalian bisa mengechek status pembayaran bookingnya
