import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { ScheduleServices } from '../services/schedule.services';

const scheduleService = new ScheduleServices()

export const scheduleRoutes = new Elysia({ prefix: '/api/schedules' })
  .group('/schedules', (app) => app)

    .get('/', async () => scheduleService.getAllMovieSchedules())
    
    .get('/:id', async ({ params, error }) => {
      const schedule = await scheduleService.getMovieSchedulesById(params.id);

      if (!schedule) {
        return error(404, { message: 'Schedule movie not found' });
      }

      return schedule
    }, {
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .get('/getScheduleByMovieId/:movieId', async ({ params }: any) => scheduleService.getMovieSchedulesByMovieId(params.movieId), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        movieId: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .get('/date/:date', async ({ params }: any) => scheduleService.getMovieScheduleByDate(new Date(params.date)), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        date: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .get('/theater/:theaterId', async ({ params }: any) => scheduleService.getMovieSchedulesByTheaterId(params.theaterId), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        theaterId: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .post('/', async ({ body }: any) => {
      return { message: 'Schedule created successfully', schedule: await scheduleService.createMovieSchedule(body)}
    },{
      beforeHandle: [authMiddleware],
      body: t.Object({
        movieId: t.String(), 
        theaterId: t.String(),
        screenNumber: t.Number(),
        startTime: t.Date(),
        endTime: t.Date(),
      }, {
        default: {
          movieId: "123e4567-e89b-12d3-a456-426614174000",  
          theaterId: "456e7890-e12b-34d5-a678-426614174111",  
          screenNumber: 1,  
          startTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),  
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()  
        }
      })
    })
    
    .put('/:id', async ({ params, body }: any) => scheduleService.updateMovieSchedule(params.id, body), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      }),
      body: t.Partial(t.Object({
        movieId: t.String(),
        theaterId: t.String(),
        screenNumber: t.Number(),
        startTime: t.Date(),
        endTime: t.Date(),
      }))
    })

    .delete('/:id', async ({ params }: any) => scheduleService.deleteMovieSchedule(params.id), {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })
    