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