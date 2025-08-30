import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { ReservationsService } from '../services/reservations.services';
import jwt from '@elysiajs/jwt';

const reservationsService = new ReservationsService()

export const reservationsRoutes = new Elysia({ prefix: '/api/reservations' })

  .get('/', async ( ) => {
    const seats = await reservationsService.getAllSeats();
    return {Seats: seats};
  })

  .get('/:id', async ({ params, error }) => {
    const seats = await reservationsService.getSeatById(params.id);
    if (!seats) {
      return error(404, { message: 'Reservation Seat not found' });
    }
    return seats;
  }, {
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .get('/theater/:theaterId', async ({ params }: any) => {
    const seats = await reservationsService.getSeatByTheaterId(params.theaterId);
    if (!seats) {
      throw new Error("NOT_FOUND");
    }
    return {Seats: seats};
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      theaterId: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .post('/', async ({ body }: any) => {
    return await reservationsService.createSeat(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      movieScheduleId: t.String(),
      seatCode: t.String(),
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await reservationsService.updateSeat(params.id, body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
    body: t.Partial(t.Object({
      theaterId: t.String(),
      screenNumber: t.Number(),
      seatCode: t.String({ pattern: "^[A-G](1[0-5]|[1-9])$" }),  // Validasi dengan Regex,
      status: t.String(),
    }))
  })

  .put('/updateStatus/:id', async ({ params }: any) => {
    const seatStatus = await reservationsService.updateSeatStatus(params.id)
    return {msg: "now seat is " + seatStatus}
  }, {
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .delete('/:id', async ({ params }: any) => {
    return await reservationsService.deleteSeat(params.id)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })