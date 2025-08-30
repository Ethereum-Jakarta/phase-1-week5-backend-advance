import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { TicketsServices } from '../services/tickets.services';
import { Tickets } from '../db/schema';

const ticketsService = new TicketsServices()

export const ticketsRoutes = new Elysia({ prefix: '/api/tickets' })
  // .use(authMiddleware)

  .get('/getOwnTicket', async ({ jwt, set, cookie: { auth } }: any) => {

    const profile = await jwt.verify(auth.value)

    if (!profile) {
        set.status = 401
        return 'Unauthorized'
    }
    const tickets = await ticketsService.getTicketsByUserId(profile.userId as string);
    return tickets;
})

  .get('/getByUserId/:userId', async ({ params }) => {
      const tickets = await ticketsService.getTicketsByUserId(params.userId as string);
      return tickets;
  },{
    params: t.Object({
      userId: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .get('/getByScheduleId/:scheduleId', async ({ params }) => {
    const tickets = await ticketsService.getTicketsByScheduleId(params.scheduleId as string);
    return tickets;
  },{
    params: t.Object({
      scheduleId: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

  .post('/', async ({ body }: any) => {
    
    return await ticketsService.createTicket(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      userId: t.String(),
      scheduleId: t.String(),
      seatId: t.String(),
      price: t.Number(),
    })
  })

  .post('/orderTickets', async ({jwt, body, cookie: { auth } }: any) => {
    const profile = await jwt.verify(auth.value)

    return await ticketsService.createTicket({...body, userId: profile.userId})
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      scheduleId: t.String(),
      seatId: t.String(),
      price: t.Number(),
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await ticketsService.updateTicket(params.id, body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
    body: t.Partial(t.Object({
      userId: t.String(),
      scheduleId: t.String(),
      seatId: t.String(),
      price: t.Number(),
    }))
  })

  .delete('/:id', async ({ params }: any) => {
    return await ticketsService.deleteTicket(params.id)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })

