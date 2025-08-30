// src/controllers/paymentController.ts
import { Elysia, t } from 'elysia';
import { TicketsServices } from '../services/tickets.services';

export const paymentRoute = new Elysia()
  .get('/success', async ({ query }) => {
    try {
      const sessionId = query.session_id;
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const ticketService = new TicketsServices();
      await ticketService.updatePaymentStatus(sessionId, 'paid');

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
        const ticketService = new TicketsServices();
        await ticketService.handleFailedPayment(sessionId, 'cancelled');
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