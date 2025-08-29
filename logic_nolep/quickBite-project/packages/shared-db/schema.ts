import { pgTable, pgEnum, varchar, text, timestamp, uuid, boolean, integer, decimal } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['customer', 'driver', 'restaurant_owner', 'admin']);
export const statusEnum = pgEnum('status', ['active', 'inactive', 'suspended']);
export const orderStatusEnum = pgEnum('order_status', [
   'pending',
   'confirmed',
   'preparing',
   'ready',
   'picked_up',
   'delivered',
   'cancelled'
]);

// users-service
export const users = pgTable('users', {
   id: uuid('id').defaultRandom().primaryKey(),
   fullName: varchar('full_name', { length: 255 }).notNull(),
   email: varchar('email', { length: 255 }).notNull().unique(),
   password: varchar('password', { length: 255 }).notNull(),
   phone: varchar('phone', { length: 50 }),
   role: roleEnum('role').default('customer'),
   status: statusEnum('status').default('active'),
   address: varchar('address', { length: 500 }),
   city: varchar('city', { length: 255 }),
   createdAt: timestamp('created_at').defaultNow(),
   updatedAt: timestamp('updated_at').defaultNow()
});

export const userSession = pgTable('user_sessions', {
   id: uuid('id').defaultRandom().primaryKey(),
   userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
   tokenHash: varchar('token_hash'),
   expiresAt: timestamp('expires_at'),
   createdAt: timestamp('created_at').defaultNow()
});

// restaurant-service
export const restaurant = pgTable('restaurant', {
   id: uuid('id').defaultRandom().primaryKey(),
   ownerId: uuid('owner_id').notNull().references(() => users.id),
   name: varchar('name', { length: 255 }).notNull(),
   description: varchar('description', { length: 500 }),
   cuisineType: varchar('cuisine_type'),
   address: varchar('address', { length: 500 }),
   city: varchar('city', { length: 100 }),
   latitude: decimal('latitude', { precision: 10, scale: 8 }),
   longitude: decimal('longitude', { precision: 11, scale: 8 }),
   phone: varchar('phone', { length: 20 }),
   email: varchar('email', { length: 100 }).notNull().unique(),
   rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
   totalReviews: integer('total_reviews').default(0),
   isActive: boolean('is_active').default(true),
   isVerified: boolean('is_verified').default(false),
   deliveryFee: decimal('delivery_fee', { precision: 8, scale: 2 }).default('3.00'),
   minimumOrder: decimal('minimum_order', { precision: 8, scale: 2 }).default('1.00'),
   estimatedPrepTime: integer('estimated_prep_time').default(10),
   isOpen: boolean('is_open').default(true),
   createdAt: timestamp('created_at').defaultNow(),
   updatedAt: timestamp('updated_at').defaultNow()
});

export const menuCategories = pgTable('menu_categories', {
   id: uuid('id').defaultRandom().primaryKey(),
   restaurantId: uuid('restaurant_id').references(() => restaurant.id, { onDelete: 'cascade' }),
   name: varchar('name', { length: 255 }).notNull(),
   description: varchar('description', { length: 500 }),
   sortOrder: integer('sort_order').default(0),
   isActive: boolean('is_active').default(true)
});

export const menuItems = pgTable('menu_items', {
   id: uuid('id').defaultRandom().primaryKey(),
   restaurantId: uuid('restaurant_id').references(() => restaurant.id, { onDelete: 'cascade' }),
   categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'cascade' }),
   name: varchar('name', { length: 255 }).notNull(),
   description: varchar('description', { length: 500 }),
   price: decimal('price', { precision: 8, scale: 2 }).notNull(),
   isAvailable: boolean('is_available').default(true),
   preparationTime: integer('preparation_time').default(5),
   createdAt: timestamp('created_at').defaultNow(),
   updatedAt: timestamp('updated_at').defaultNow()
});

// order-service
export const orders = pgTable('orders', {
   id: uuid('id').defaultRandom().primaryKey(),
   orderNumber: varchar('order_number', { length: 20 }).unique().notNull(),
   customerId: uuid('customer_id').notNull().references(() => users.id),
   restaurantId: uuid('restaurant_id').notNull().references(() => restaurant.id),
   driverId: uuid('driver_id').references(() => users.id),
   status: orderStatusEnum('order_status').default('pending').notNull(),
   subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
   deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull().default('0'),
   totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
   deliveryAddress: varchar('delivery_address').notNull(),
   estimatedDeliveryTime: timestamp('estimated_delivery_time'),
   actualDeliveryTime: timestamp('actual_delivery_time'),
   createdAt: timestamp('created_at').defaultNow().notNull(),
   updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const orderItems = pgTable('order_items', {
   id: uuid('id').defaultRandom().primaryKey(),
   orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
   menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id),
   menuItemName: varchar('menu_item_name', { length: 255 }).notNull(),
   quantity: integer('quantity').notNull(),
   unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
   totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
   createdAt: timestamp('created_at').defaultNow().notNull()
});

export const orderStatusHistory = pgTable('order_status_history', {
   id: uuid('id').defaultRandom().primaryKey(),
   orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
   status: orderStatusEnum('order_status').notNull(),
   changedAt: timestamp('changed_at').defaultNow().notNull(),
   notes: text('notes')
});

export type Restaurant = typeof restaurant.$inferSelect;
export type NewRestaurant = typeof restaurant.$inferInsert;
export type MenuItems = typeof menuItems.$inferSelect;
export type NewMenuItems = typeof menuItems.$inferInsert;