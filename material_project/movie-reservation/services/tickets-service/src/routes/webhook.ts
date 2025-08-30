// src/controllers/webhookController.ts
import { Elysia } from 'elysia';
import { stripe } from '../config/stripe';
import { TicketsServices } from '../services/tickets.services';

export const webhookRoute = new Elysia()
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

      console.log(event, "WEBHOOK MASUKKK")

      const ticketService = new TicketsServices();

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await ticketService.updatePaymentStatus(session.id, 'paid');
          break;
        }
        case 'checkout.session.expired': {
          const session = event.data.object;
          await ticketService.handleFailedPayment(session.id, 'failed');
          break;
        }
        case 'checkout.session.async_payment_failed': {
          const session = event.data.object;
          await ticketService.handleFailedPayment(session.id, 'failed');
          break;
        }
      }

      return { received: true };
    } catch (err: any) {
      console.error('Webhook error:', err);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  });