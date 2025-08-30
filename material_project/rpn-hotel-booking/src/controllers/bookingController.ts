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