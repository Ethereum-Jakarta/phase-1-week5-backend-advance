import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { ticketsRoutes } from './routes/tickets.route';
import { errorHandler } from './middleware/errorHandler';
import { paymentRoute } from './routes/payment.route';
import jwt from '@elysiajs/jwt';
import dotenv from 'dotenv';
import { webhookRoute } from './routes/webhook';
dotenv.config();

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      exp: "1h",
    })
  )
  .use(cors())
  // .onError(({ code, error, set }) => {
  //   console.log("error errorHandler")
  //   switch (code) {
  //     case 'VALIDATION':
  //       set.status = 400;
  //       return { error: error.message };
  //     case 'NOT_FOUND':
  //       set.status = 404;
  //       return { error: 'Resource not found' };
  //     default:
  //       set.status = 500;
  //       return { error: 'Internal server error' };
  //   }
  // })

  .use(ticketsRoutes)
  .use(webhookRoute)
  .use(paymentRoute)
  .use(errorHandler)
  
  
  .listen(process.env.PORT || 3005);

console.log(`🦊 Seat Reservastion service running at ${app.server?.hostname}:${app.server?.port}`);