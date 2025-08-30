// src/types/index.ts
import { t } from 'elysia';
import type { InferModel } from 'drizzle-orm';
import { rooms, bookings, facilities, customers } from '../db/schema';

export const FacilitySchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
});

export const RoomFacilitySchema = t.Object({
  id: t.String(),
  name: t.String(),
});

export const RoomSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  pricePerNight: t.Number(),
  capacity: t.Number(),
  facilities: t.Array(RoomFacilitySchema),
  isAvailable: t.Boolean(),
  roomNumber: t.String(),
  floorNumber: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date()
});

export const CustomerSchema = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  phone: t.Optional(t.String()),
  address: t.Optional(t.String()),
  idNumber: t.Optional(t.String()),
  idType: t.Optional(t.String()),
});

export const CreateRoomSchema = t.Object({
  name: t.String(),
  description: t.String(),
  pricePerNight: t.Union([t.String(), t.Number()]), // Accept both string and number
  capacity: t.Union([t.String(), t.Number()]), // Accept both string and number
  facilityIds: t.Array(t.String()),
  roomNumber: t.String(),
  floorNumber: t.String()
});

export const CreateCustomerSchema = t.Object({
  name: t.String(),
  email: t.String(),
  phone: t.Optional(t.String()),
  address: t.Optional(t.String()),
  idNumber: t.Optional(t.String()),
  idType: t.Optional(t.String()),
});

export const BookingRequestSchema = t.Object({
roomId: t.String(),
    guestName: t.String(),
    guestEmail: t.String(),
    checkIn: t.String(),
    checkOut: t.String(),
    numberOfGuests: t.Number(),
    specialRequests: t.Optional(t.String())
});

// Array schemas for responses
export const FacilitiesArraySchema = t.Array(FacilitySchema);
export const RoomsArraySchema = t.Array(RoomSchema);

export type BookingRequest = {
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  specialRequests?: string;
};

// Types
export type Room = InferModel<typeof rooms>;
export type Facility = InferModel<typeof facilities>;
export type Customer = InferModel<typeof customers>;
export type Booking = InferModel<typeof bookings>;