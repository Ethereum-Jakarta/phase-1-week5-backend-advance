// Update src/index.ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import swaggers from './swaggers';
import { roomController } from './controllers/roomController';
import { customerController } from './controllers/customerController';
import { bookingController } from './controllers/bookingController';
import { facilityController } from './controllers/facilityController';
import { paymentController } from './controllers/paymentController';

const app = new Elysia()
  .use(cors())
  .use(swagger({ documentation: swaggers }))
  .use(roomController)
  .use(customerController)
  .use(bookingController)
  .use(facilityController)
  .use(paymentController)
  .listen(process.env.PORT || 3000);

console.log(`
🏨 Hotel Booking API is running!
📚 API Documentation: http://localhost:${process.env.PORT || 3000}/swagger
`);