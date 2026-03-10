import { Elysia, json } from 'elysia';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import amqp from 'amqplib';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

const app = new Elysia();

let channel: amqp.Channel;

async function connectRabbit() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('email_notifications', { durable: true });
  console.log('Connected to RabbitMQ, queue email_notifications ready');
}
connectRabbit();

app.post('/create-checkout-session', async (c) => {
  try {
    const { productId, email, name } = await c.body;

    if (!productId || !email) {
      return {
        status: 400,
        body: { error: 'productId and email are required' }
      };
    }

    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      return {
        status: 400,
        body: { error: 'No active price found for this product' }
      };
    }

    const priceId = prices.data[0].id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      customer_email: email,
      success_url: process.env.SUCCESS_URL || 'http://localhost:3000/success',
      cancel_url: process.env.CANCEL_URL || 'http://localhost:3000/cancel',
      metadata: { name: name || 'Customer' },
    });

    return {
      status: 200,
      body: { url: session.url }
    };
  } catch (error: any) {
    return {
      status: 500,
      body: { error: error.message }
    };
  }
});


app.post('/webhook', async (c) => {
  const sig = c.req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    const rawBody = await c.req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (err: any) {
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

 if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;

  const msg = {
    email: session.customer_details?.email,
    name: session.customer_details?.name || 'Customer',
    amount: session.amount_total ? session.amount_total / 100 : 0,
    paymentIntentId: session.payment_intent,
  };

  try {
    channel.sendToQueue('email_notifications', Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
    console.log('Email receipt queued for', msg.email);
  } catch (err) {
    console.error('Failed to send message to queue', err);
  }
}

  return c.json({ received: true });
});


app.post('/refund', async (c) => {
  try {
    const { paymentIntentId, amount } = await c.body;

    if (!paymentIntentId) {
      return c.json({ error: 'paymentIntentId is required' }, 400);
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    const refund = await stripe.refunds.create(refundParams);
    return {
  status: 200,
  body: { message: 'Refund created', refund }
};

  } catch (error: any) {
    return {
  status: 500,
  body: { error: error.message }
};
  }
});

app.listen({ port: Number(process.env.PORT) || 3002 });

console.log('Payment service running on port', process.env.PORT || 3002);
