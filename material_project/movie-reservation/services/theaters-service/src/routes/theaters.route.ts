import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { TheatersService } from '../services/theaters.services';
import jwt from '@elysiajs/jwt';

const theatersService = new TheatersService()

export const theatersRoutes = new Elysia({ prefix: '/api/theaters' })
  .get('/', async ( ) => {
    const theater = await theatersService.getAllTheaters();
    return {Theaters: theater};
  })

  .get('/:id', async ({ params, set, query }: any) => {
    const { screenNumber } = query
    const theater = await theatersService.getTheaterById(params.id);

    if (!theater) {
      throw new Error("NOT_FOUND");
    }

    if (screenNumber >= theater.totalScreens){
      set.status = 400
      throw new Error('Screen number out of range');
    }

    return theater;
  }, {
    params: t.Object({
      id: t.String(),  // t.Number() lebih baik jika id harus angka
    }),
    query: t.Object({
      screenNumber: t.Optional(t.Number()), // ✅ Now in query instead of params
    })
  })
  
  .post('/', async ({ body }: any) => {
    return await theatersService.createTheater(body)
  }, {
    body: t.Object({
      name: t.String(),
      address: t.String(),
      city: t.String(),
      totalScreens: t.Number(),
    })
  })

  .put('/:id', async ({ params, body }: any) => {
    return await theatersService.updateTheater((params.id), body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
    body: t.Partial(t.Object({  // Gunakan Partial untuk memperbolehkan update sebagian
      name: t.String(),
      address: t.String(),
      city: t.String(),
      totalScreens: t.Number(),
    }))
  })

  .delete('/:id', async ({ params }: any) => {
    const theater = await theatersService.deleteTheater(params.id);
    return { message: 'Theater deleted successfully', theater };
  },{
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    }),
  })

  .get('/profile', async ({ jwt, set, cookie: { auth } }: any) => {
    const profile = await jwt.verify(auth.value)

    if (!profile) {
        set.status = 401
        return 'Unauthorized'
    }

    return  { message: 'You are authenticated!', profile } 
  })
