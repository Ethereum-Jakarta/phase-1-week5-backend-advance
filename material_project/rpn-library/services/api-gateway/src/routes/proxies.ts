// src/routes/proxies.ts
import { Elysia, t } from 'elysia'
import { services } from '../config/services'
import { authMiddleware } from '../middleware/auth'

export const proxies = new Elysia()
  .group('/api/resource', app => app
    .get('/', async ({ request }: any) => {
      // Log incoming request headers
      console.log('Request headers:', Object.fromEntries(request.headers))
      // ... rest of the handler
    }, {
      beforeHandle: [authMiddleware]
    })
  )
  
  // User Service Routes
  .group('/api/users', app => app
    // Public routes
    .post('/register', async ({ body }: any) => {
      const response = await fetch(`${services.users.url}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      return response.json()
    }, {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String()
      })
    })
    
    .post('/login', async ({ body }: any) => {
      const response = await fetch(`${services.users.url}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      return response.json()
    }, {
      body: t.Object({
        email: t.String(),
        password: t.String()
      })
    })

    // Protected routes with auth
    .get('/:id', async ({ request, params }: any) => {
      try {
        const response = await fetch(`${services.users.url}/api/users/${params.id}`, {
          method: 'GET',
          headers: {
            ...request.headers,
            'Authorization': request.headers.get('authorization') || '',
            'Content-Type': 'application/json'
          }
        })
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
    
        const data = await response.json()
        return data
      } catch (error: any) {
        console.error('Error fetching user:', error)
        throw new Error(`Failed to fetch user: ${error.message}`)
      }
    }, {
      beforeHandle: [authMiddleware]
    })

    .put('/:id', async ({ request, params, body }: any) => {
      const response = await fetch(`${services.users.url}/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          ...request.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      return response.json()
    }, {
      beforeHandle: [authMiddleware],
      body: t.Object({
        username: t.Optional(t.String()),
        email: t.Optional(t.String()),
        password: t.Optional(t.String())
      })
    })
  )

  // Update swagger configuration untuk menambahkan semua endpoint
  .group('/api/books', app => app
    .get('/', async ({ request }: any) => {
      const response = await fetch(`${services.catalog.url}/api/books`, {
        headers: request.headers
      })
      return response.json()
    })
    
    .get('/:id', async ({ request, params }: any) => {
      const response = await fetch(`${services.users.url}/api/books/${params.id}`, {
        headers: {
          ...Object.fromEntries(request.headers)
        }
      })
      const data = await response.json()
      return data
    }, {
      beforeHandle: [authMiddleware]
    })

    .post('/', async ({ request, body }: any) => {
      const response = await fetch(`${services.catalog.url}/api/books`, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('authorization'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }
      
      return response.json()
    }, {
      beforeHandle: [authMiddleware],
      body: t.Object({
        title: t.String(),
        author: t.String(),
        isbn: t.String(),
        description: t.Optional(t.String()),
        categoryId: t.Optional(t.Number()),
        totalCopies: t.Number(),
        availableCopies: t.Number()
      })
    })
    .get('/', async ({ request, query }: any) => {
      const url = new URL(`${services.catalog.url}/api/books`)
      if (query.search) url.searchParams.set('search', query.search)
      if (query.page) url.searchParams.set('page', query.page)
      if (query.limit) url.searchParams.set('limit', query.limit)
      
      const response = await fetch(url, {
        headers: request.headers
      })
      return response.json()
    })
    
    .get('/:id', async ({ request, params }: any) => {
      const response = await fetch(`${services.catalog.url}/api/books/${params.id}`, {
        headers: request.headers
      })
      return response.json()
    })
   )
   
   .group('/api/categories', app => app
    .get('/', async ({ request }: any) => {
      const response = await fetch(`${services.catalog.url}/api/categories`, {
        headers: request.headers
      })
      return response.json()
    })
   
    .get('/:id', async ({ request, params }: any) => {
      const response = await fetch(`${services.catalog.url}/api/categories/${params.id}`, {
        headers: request.headers 
      })
      return response.json()
    })
   
    .post('/', async ({ request, body }: any) => {
      const response = await fetch(`${services.catalog.url}/api/categories`, {
        method: 'POST',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      return response.json()
    }, {
      beforeHandle: [authMiddleware],
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String())
      })
    })
   
    .put('/:id', async ({ request, params, body }: any) => {
      const response = await fetch(`${services.catalog.url}/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      return response.json()
    }, {
      beforeHandle: [authMiddleware],
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String())
      })
    })
   
    .delete('/:id', async ({ request, params }: any) => {
      const response = await fetch(`${services.catalog.url}/api/categories/${params.id}`, {
        method: 'DELETE',
        headers: request.headers
      })
      return response.json()
    }, {
      beforeHandle: [authMiddleware]
    })

  )

  // Borrowing Routes
  .group('/api/loans', app => app
    .get('/', async ({ request, query }: any) => {
      const url = new URL(`${services.borrowing.url}/api/loans`)
      if (query.page) url.searchParams.set('page', query.page)
      if (query.limit) url.searchParams.set('limit', query.limit)
      
      const response = await fetch(url, {
        headers: request.headers
      })
      return response.json()
    })

    .get('/:id', async ({ request, params, query }: any) => {
      const url = new URL(`${services.borrowing.url}/api/loans/${params.id}`)
      if (query.status) url.searchParams.set('status', query.status)
      
      const response = await fetch(url, {
        headers: request.headers
      })
      return response.json()
    })

    .post('/', async ({ request, body }: any) => {
      try {
        console.log('Loan request body:', body) // Debug log
        
        const response = await fetch(`${services.borrowing.url}/api/loans`, {
          method: 'POST',
          headers: {
            'Authorization': request.headers.get('authorization'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: Number(body.userId),
            bookId: Number(body.bookId)
          })
        })
  
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message)
        }
  
        return response.json()
      } catch (error) {
        console.error('Error creating loan:', error)
        throw error
      }
    }, {
      beforeHandle: [authMiddleware],
      body: t.Object({
        userId: t.Number({ required: true }),
        bookId: t.Number({ required: true })
      })
    })

    .put('/:id/return', async ({ request, params }: any) => {
      const response = await fetch(`${services.borrowing.url}/api/loans/${params.id}/return`, {
        method: 'PUT',
        headers: request.headers
      })
      return response.json()
    })

    .get('/overdue', async ({ request }: any) => {
      const response = await fetch(`${services.borrowing.url}/api/loans/overdue`, {
        headers: request.headers
      })
      return response.json()
    })
  )

  // Review Routes
  // API Gateway - src/routes/proxies.ts
.group('/api/reviews', app => app
  .post('/', async ({ request, body }: any) => {
    try {
      console.log('Received body:', body) // Debug log
      
      const response = await fetch(`${services.reviews.url}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('authorization'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: Number(body.userId),
          bookId: Number(body.bookId),
          rating: Number(body.rating),
          comment: body.comment
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      return response.json()
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }, {
    beforeHandle: [authMiddleware],
    body: t.Object({
      userId: t.Number({ required: true }),
      bookId: t.Number({ required: true }),
      rating: t.Number({ required: true, minimum: 1, maximum: 5 }),
      comment: t.Optional(t.String())
    })
  })

  .get('/book/:bookId', async ({ request, params, query }: any) => {
    const url = new URL(`${services.reviews.url}/api/reviews/book/${params.bookId}`)
    if (query.page) url.searchParams.set('page', query.page)
    if (query.limit) url.searchParams.set('limit', query.limit)
    
    const response = await fetch(url, {
      headers: request.headers
    })
    return response.json()
  })

  .get('/user/:userId', async ({ request, params }: any) => {
    const response = await fetch(`${services.reviews.url}/api/reviews/user/${params.userId}`, {
      headers: request.headers
    })
    return response.json()
  })

  .put('/:id', async ({ request, params, body }: any) => {
    const response = await fetch(`${services.reviews.url}/api/reviews/${params.id}`, {
      method: 'PUT',
      headers: {
        ...Object.fromEntries(request.headers),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response.json()
  })

  .delete('/:id', async ({ request, params, body }: any) => {
    const response = await fetch(`${services.reviews.url}/api/reviews/${params.id}`, {
      method: 'DELETE',
      headers: {
        ...Object.fromEntries(request.headers),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response.json()
  })
)

.group('/api/notifications', app => app
  .get('/user/:userId', async ({ request, params, query }: any) => {
    const url = new URL(`${services.notification.url}/api/notifications/user/${params.userId}`)
    if (query.page) url.searchParams.set('page', query.page)
    if (query.limit) url.searchParams.set('limit', query.limit)
    
    const response = await fetch(url, {
      headers: request.headers
    })
    return response.json()
  }, {
    beforeHandle: [authMiddleware]
  })
)