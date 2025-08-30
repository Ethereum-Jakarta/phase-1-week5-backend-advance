import { Elysia, t } from 'elysia';
import { UserService } from '../services/user.services';
import { jwt } from '@elysiajs/jwt'

const userService = new UserService()

export const authRoutes = new Elysia({ prefix: '/auth' })
  

  .post('/register', async ({ body }: any) => {
      return await userService.createUser(body)
    }, {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
        phone: t.String(),
      })
    })
    
    // @ts-ignore
    .post('/login', async ({ body, cookie: { auth }, jwt }) => {
      const user = await userService.loginUser(body.email, body.password)
      const jwtData = { 
        userId: user.id, 
        email: user.email, 
        phone: user.phone
      } as any;
      auth.set({
        value: await jwt.sign(jwtData),
        httpOnly: true,
        maxAge: 7 * 86400,
        secure: true,  // Gunakan HTTPS di production
        sameSite: 'lax', // Harus None jika frontend dan backend berbeda domain
        path: '/',
      })
      return auth.value
    }, {
      body: t.Object({
        email: t.String(),
        password: t.String()
      })
    })