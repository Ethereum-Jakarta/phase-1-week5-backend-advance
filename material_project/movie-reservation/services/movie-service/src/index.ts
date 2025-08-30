import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { moviesRoutes } from './routes/movie.route';
import { scheduleRoutes } from './routes/schedule.route';
import { errorHandler } from './middleware/errorHandler';
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

  .use(moviesRoutes)
  .use(scheduleRoutes)
  .use(errorHandler)
  
  
  .listen(process.env.PORT || 3002);

console.log(`🦊 Movie service running at ${app.server?.hostname}:${app.server?.port}`);