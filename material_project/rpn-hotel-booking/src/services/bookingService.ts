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