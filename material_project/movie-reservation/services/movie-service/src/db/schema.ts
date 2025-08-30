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