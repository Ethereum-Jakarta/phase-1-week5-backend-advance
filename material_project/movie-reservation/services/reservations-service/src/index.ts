import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { reservationsRoutes } from './routes/reservations.route';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      exp: "1h",
    })
  )
  .use(cors({
    origin: "http://localhost:3005", // Replace with your frontend URL
    credentials: true, // Allow sending cookies
  }))
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

  .use(reservationsRoutes)
  .use(errorHandler)
  
  .listen(process.env.PORT || 3003);

console.log(`🦊 Seat Reservastion service running at ${app.server?.hostname}:${app.server?.port}`);