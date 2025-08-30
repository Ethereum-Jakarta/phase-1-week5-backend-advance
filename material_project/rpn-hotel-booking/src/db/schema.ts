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