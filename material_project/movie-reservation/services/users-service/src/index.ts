import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user.route';
import { errorHandler } from './middleware/errorHandler';
import jwt from '@elysiajs/jwt';

const app = new Elysia()
  .use(cors({ credentials: true, origin: 'http://localhost', }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET! || 'randomparanolep',
      refresh: {
        maxAge: 7 * 86400,
        httpOnly: true
      },
    })
  )
  .use(errorHandler)
  .use(swagger({ path: '/docs' }))
  .use(authRoutes)
  .use(userRoutes)
  
  .listen(process.env.PORT || 3001);

console.log(`🦊 Users service running at ${app.server?.hostname}:${app.server?.port}`);