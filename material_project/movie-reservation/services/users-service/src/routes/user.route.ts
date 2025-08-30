import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { UserService } from '../services/user.services';
import jwt from '@elysiajs/jwt';

const userService = new UserService()

export const userRoutes = new Elysia({ prefix: '/api/users' })
  
  // @ts-ignore
  .get('/:id', async ({ params, error }) => {
    // console.log("Received ID:", params.id);
    const user = await userService.getUserById(params.id);

    if (!user) {
      return error(404, { message: 'User not found' });
    }

    return user;
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()  // t.Number() lebih baik jika id harus angka
    })
  })
  
  .put('/:id', async ({ params, body }: any) => {
    return await userService.updateUser((params.id), body)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      email: t.Optional(t.String({ format: 'email' })),
      password: t.Optional(t.String()),
      phone: t.Optional(t.String())
    })
  })

  .get('/profile', async ({ jwt, set, cookie: { auth } }: any) => {
    const profile = await jwt.verify(auth.value)

    if (!profile) {
        set.status = 401
        return 'Unauthorized'
    }

    return  { message: 'You are authenticated!', profile } 
  },{
    beforeHandle: [authMiddleware],
  })