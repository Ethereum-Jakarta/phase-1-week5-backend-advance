// src/routes/notificationRoutes.ts
import { Elysia, t } from 'elysia'
import { NotificationService } from '../services/notificationService'
import { authMiddleware } from '../middleware/auth'

const notificationService = new NotificationService()

export const notificationRoutes = new Elysia({ prefix: '/api/notifications' })
  .get('/user/:userId', async ({ params, query }: any) => {
    const { page = 1, limit = 10 } = query
    return await notificationService.getUserNotifications(
      Number(params.userId),
      Number(page),
      Number(limit)
    )
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      userId: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String())
    })
  })
  .post('/test', async ({ body }: any) => {
    return await notificationService.sendTestNotification(body)
  }, {
    body: t.Object({
      email: t.String(),
      type: t.String({
        enum: ['TEST_EMAIL', 'LOAN_DUE', 'BOOK_RETURNED']
      })
    })
  })
  