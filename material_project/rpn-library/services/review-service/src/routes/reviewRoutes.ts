// src/routes/reviewRoutes.ts
import { Elysia, t } from 'elysia'
import { ReviewService } from '../services/reviewService'
import { authMiddleware } from '../middleware/auth'

const reviewService = new ReviewService()

export const reviewRoutes = new Elysia({ prefix: '/api/reviews' })
  .post('/', async ({ body }) => {
    return await reviewService.createReview(body)
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      userId: t.Number(),
      bookId: t.Number(),
      rating: t.Number(),
      comment: t.Optional(t.String())
    })
  })

  .get('/book/:bookId', async ({ params, query }) => {
    const { page = 1, limit = 10 } = query
    return await reviewService.getBookReviews(Number(params.bookId), Number(page), Number(limit))
  }, {
    params: t.Object({
      bookId: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String())
    })
  })

  .get('/user/:userId', async ({ params }) => {
    return await reviewService.getUserReviews(Number(params.userId))
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      userId: t.String()
    })
  })

  .put('/:id', async ({ params, body }) => {
    const { userId, ...updateData } = body
    return await reviewService.updateReview(Number(params.id), userId, updateData)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      userId: t.Number(),
      rating: t.Optional(t.Number()),
      comment: t.Optional(t.String())
    })
  })

  .delete('/:id', async ({ params, body }) => {
    return await reviewService.deleteReview(Number(params.id), body.userId)
  }, {
    beforeHandle: [authMiddleware],
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      userId: t.Number()
    })
  })