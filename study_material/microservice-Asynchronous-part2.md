### 6. API Gateway
bagian ini kalian akan membuat bagian  api gateway server yang mengumpulkan semua service kedalam
satu host server agar lebih mudah di gunakan

- package.json
```json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/swagger": "latest",
    "elysia": "latest",
    "jsonwebtoken": "latest"
  },
  "devDependencies": {
    "bun-types": "latest",
    "@types/jsonwebtoken": "latest"
  }
}
```

- .env
```
JWT_SECRET=randomparanolep
USER_SERVICE_URL=http://localhost:3001
CATALOG_SERVICE_URL=http://localhost:3002
BORROWING_SERVICE_URL=http://localhost:3003
REVIEW_SERVICE_URL=http://localhost:3004
```

- src/config/services.ts
```ts
// src/config/services.ts
export const services = {
  users: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    endpoints: {
      register: '/api/users/register',
      login: '/api/users/login',
      profile: '/api/users/:id'
    }
  },
  catalog: {
    url: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
    endpoints: {
      books: '/api/books',
      categories: '/api/categories'
    }
  },
  borrowing: {
    url: process.env.BORROWING_SERVICE_URL || 'http://localhost:3003',
    endpoints: {
      loans: '/api/loans',
      returns: '/api/returns'
    }
  },
  reviews: {
    url: process.env.REVIEW_SERVICE_URL || 'http://localhost:3004',
    endpoints: {
      reviews: '/api/reviews'
    }
  },
  notification: {
    url: process.env.REVIEW_SERVICE_URL || 'http://localhost:3005',
    endpoints: {
      notification: '/api/notification'
    }
  }
}
```

sekarang ke midleware

- src/middleware/auth.ts

```ts
import { verify } from "./jwt"
// src/middleware/auth.ts

export const authMiddleware = async ({ request, set }: any) => {
  const authHeader = request.headers.get('authorization')
  console.log('Auth header:', authHeader) // Debug log

  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized - No token provided' }
  }

  try {
    const token = authHeader.split(' ')[1]
    console.log('Token to verify:', token) // Debug log

    const payload = await verify(token)
    console.log('Token payload:', payload) // Debug log

    // Ensure token is properly set for downstream requests
    if (!request.headers.has('authorization')) {
      request.headers.set('authorization', authHeader)
    }

    return
  } catch (error) {
    console.error('Auth error:', error)
    set.status = 401
    return { error: 'Invalid token' }
  }
}
```

- src/middleware/errorHandler.ts

```ts
// src/middleware/errorHandler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, set }: any) => {
    console.error(`Error: ${error.message}`)
    
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { error: 'Not Found' }
      case 'VALIDATION':
        set.status = 400
        return { error: 'Validation Error', details: error.message }
      default:
        set.status = 500
        return { 
          error: 'Internal Server Error',
          message: error.message 
        }
    }
  })
```

- src/middleware/jwt.ts

```ts
// src/middleware/jwt.ts
import { verify as jwtVerify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JWTPayload {
  id: string
  [key: string]: any
}

export const verify = (token: string): Promise<JWTPayload> => {
  return new Promise((resolve, reject) => {
    jwtVerify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as JWTPayload)
      }
    })
  })
}
```

- src/middleware/logger.ts

```ts
// src/middleware/logger.ts
import { Elysia } from 'elysia';

export const logger = new Elysia()
    .onRequest(({ request }) => {
        console.log(`${new Date().toISOString()} [Request] ${request.method} ${request.url}`);
    })
    .on('afterHandle', ({ request, response }) => {
        console.log(
            `${new Date().toISOString()} [Response] ${request.method} ${request.url} - Status: ${response?.status}`
        );
    });

```

- src/middleware/rateLimit.ts

```ts
// src/middleware/rateLimit.ts
import { Elysia } from 'elysia'

const rateLimits = new Map()

export const rateLimit = new Elysia().onRequest(({ request, set }: any) => {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const limit = 100 // requests per windowMs

  const requests = rateLimits.get(ip) || []
  const windowStart = now - windowMs

  // Clean old requests
  while (requests.length && requests[0] <= windowStart) {
    requests.shift()
  }

  if (requests.length >= limit) {
    set.status = 429
    return { error: 'Too many requests' }
  }

  requests.push(now)
  rateLimits.set(ip, requests)
})
```

- src/routes/proxies.ts

```ts
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
```

- 

```ts
// src/swagger/config.ts
export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Digital Library API Gateway',
    version: '1.0.0',
    description: 'Complete API documentation for Digital Library Microservices'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          email: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Book: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          author: { type: 'string' },
          isbn: { type: 'string' },
          totalCopies: { type: 'integer' },
          availableCopies: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Loan: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          bookId: { type: 'integer' },
          borrowDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          returnDate: { type: 'string', format: 'date-time', nullable: true },
          status: { 
            type: 'string',
            enum: ['ACTIVE', 'RETURNED', 'OVERDUE']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          bookId: { type: 'integer' },
          userId: { type: 'integer' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          type: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    // Auth & User Management
    '/api/users/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'johndoe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', format: 'password', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': {
            description: 'Invalid input'
          }
        }
      }
    },
    '/api/users/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    },

    // Book Management
    '/api/books': {
      get: {
        tags: ['Books'],
        summary: 'Get all books',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of books',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Book' }
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Books'],
        summary: 'Add new book',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'author', 'isbn', 'totalCopies', 'availableCopies'],
                properties: {
                  title: { type: 'string', example: 'Book Title' },
                  author: { type: 'string', example: 'Author Name' },
                  isbn: { type: 'string', example: '9781234567890' },
                  description: { type: 'string', example: 'Book description' },
                  categoryId: { type: 'integer', example: 1 },
                  totalCopies: { type: 'integer', example: 10 },
                  availableCopies: { type: 'integer', example: 10 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Book created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Book'
                }
              }
            }
          }
        }
      }
    },
    '/api/books/{id}': {
      get: {
        tags: ['Books'],
        summary: 'Get book by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Book found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' }
              }
            }
          }
        }
      }
    },

    paths: {
      '/api/books': {
        get: {
          tags: ['Books'],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' }
            },
            {
              name: 'page',
              in: 'query', 
              schema: { type: 'integer' }
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'List of books'
            }
          }
        }
      },
      
      '/api/categories': {
        get: {
          tags: ['Categories'],
          responses: {
            '200': {
              description: 'List of categories'
            }
          }
        },
        post: {
          tags: ['Categories'],
          summary: 'Create categories by ID',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Category created'
            }
          }
        }
      },
      
      '/api/categories/{id}': {
        get: {
          tags: ['Categories'],
          summary: 'Get categories by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Category details'
            }
          }
        },
        put: {
          tags: ['Categories'],
          summary: 'Edit acategories',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Category updated'
            }
          }
        },
        delete: {
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Category deleted'
            }
          }
        }
      }
     },

    // Loan Management
    '/api/loans': {
      get: {
        tags: ['Loans'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { 
              type: 'string',
              default: '1'
            }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { 
              type: 'string',
              default: '10'
            }
          }
        ],
        responses: {
          '200': {
            description: 'List of all loans',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Loan'
                      }
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Loans'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'bookId'],
                properties: {
                  userId: { 
                    type: 'integer',
                    example: 1
                  },
                  bookId: { 
                    type: 'integer',
                    example: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Loan created successfully'
          }
        }
      }
    },

    '/api/loans/{id}': {
      get: {
        tags: ['Loans'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['ACTIVE', 'RETURNED', 'OVERDUE']
            }
          }
        ],
        responses: {
          '200': {
            description: 'User loans'
          }
        }
      }
    },

    '/api/loans/{id}/return': {
      put: {
        tags: ['Loans'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Book returned successfully'
          }
        }
      }
    },

    '/api/loans/overdue': {
      get: {
        tags: ['Loans'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of overdue loans'
          }
        }
      }
    },

    // Review Management
    '/api/reviews': {
      post: {
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'bookId', 'rating'], // Remove comment from required
                properties: {
                  userId: { 
                    type: 'integer',
                    example: 1 
                  },
                  bookId: { 
                    type: 'integer',
                    example: 1 
                  },
                  rating: { 
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    example: 5
                  },
                  comment: { 
                    type: 'string',
                    example: "Great book!",
                    nullable: true // Make comment nullable
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Review created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    userId: { type: 'integer' },
                    bookId: { type: 'integer' },
                    rating: { type: 'integer' },
                    comment: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/api/reviews/book/{bookId}': {
      get: {
        tags: ['Reviews'],
        parameters: [
          {
            name: 'bookId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'List of book reviews'
          }
        }
      }
    },

    '/api/reviews/user/{userId}': {
      get: {
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'List of user reviews'
          }
        }
      }
    },

    '/api/reviews/{id}': {
      put: {
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'integer' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Review updated successfully'
          }
        }
      },
      delete: {
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Review deleted successfully'
          }
        }
      }
    },

    '/api/notifications/user/{userId}': {
      get: {
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'User notifications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' }
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
  

```

- src/utils/proxy.ts

```ts
// src/utils/proxy.ts
export async function proxy(request: Request, targetUrl: string) {
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // @ts-ignore
        ...Object.fromEntries(request.headers)
      },
      body: request.method !== 'GET' ? await request.text() : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error: any) {
    console.error('Proxy error:', error)
    throw new Error(`Service unavailable: ${error.message}`)
  }
}
```

- src/index.ts

```ts
// src/index.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'
import { proxies } from './routes/proxies'
import { logger } from './middleware/logger'
import { swaggerConfig } from './swagger/config'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    // @ts-ignore
    documentation: swaggerConfig
  }))
  .use(cors())
  .use(logger)
  .use(rateLimit)
  .use(errorHandler)
  .use(proxies)
  .listen(3000)

console.log(`🚀 API Gateway running at ${app.server?.hostname}:${app.server?.port}`)
```

ok jika kalian sudah menulis code diatas dan menjalankanya akan masuk keport 3000

### Testing dan Running project
jika kalian sudah selesai menulis codenya dan menjanlankan semua servicenya. maka kalian sudah bisa mengakses semua Service
kalian perlu menyalakan semua servicenya satu2 agar service bisa di jalankan di api gateway
dan jika kalian membuka documentasi swagger pada api gateway local host `http://localhost:3000/docs`
maka akan muncul seperti ini
![image](https://github.com/user-attachments/assets/409036a0-fdc4-44e1-88ad-3197a14890bc)


dan untuk menjalankan testing yang sudah kita buat, kita perlu masuk ke directory service kalian dan jalankan `bun test` dan kalian akan mendapatkan log testing kurang lebih seperti ini
![image](https://github.com/user-attachments/assets/de9f1e83-96fa-4397-be6f-194b2cc74d29)
![image](https://github.com/user-attachments/assets/04461657-477e-4e98-b4fc-b69397a0b41c)

## PM2

kalian telah menyelesaikan pembuatan project API microservice library.
untuk menyalakan semua service kalian perlu menjalankannya satu2 dari folder ke folder service
tetapi ada cara uintuk mempermudah ini dengan server management menggunakan PM2

### apa itu PM2
PM2 adalah proses manajer untuk aplikasi Node.js yang digunakan untuk 
menjalankan, mengelola, dan memantau aplikasi pada server. 
PM2 sangat populer di kalangan pengembang untuk mengelola aplikasi 
JavaScript/Node.js di server produksi

### Fitur Utama PM2:
1. Pengelolaan Proses Aplikasi:
- Menjalankan aplikasi secara terus-menerus (persistent) meskipun server reboot.
- Mengelola aplikasi dalam mode cluster untuk memaksimalkan penggunaan CPU.

2. Pemantauan Aplikasi:
- PM2 menyediakan pemantauan proses aplikasi secara real-time, termasuk penggunaan memori dan CPU.
- Menyediakan logging terpusat untuk memantau output aplikasi dan menangani kesalahan.

3. Load Balancing:
- Menggunakan mode cluster untuk membagi beban kerja ke beberapa inti CPU (multi-core).
- Ini membantu aplikasi berjalan lebih efisien dengan memanfaatkan semua daya pemrosesan dari server.

4. Restart Otomatis:
- PM2 dapat secara otomatis me-restart aplikasi jika terjadi crash atau error, sehingga aplikasi tetap berjalan tanpa gangguan.

5. Manajemen Log:
- Menyediakan fitur manajemen log yang memudahkan Anda untuk melacak output dari aplikasi Anda.

### setup PM2 pada project
kalian akan mencobanya pada project sebelumnya. tapi pertama install terlebih dahului

```
npm install pm2@latest -g
```

setelah kalian install maka buat ecosistemnya 

- ecosystem.config.js

```ts
// ecosystem.config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "./services/api-gateway/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_GATEWAY,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        USER_SERVICE_URL: process.env.USER_SERVICE_URL,
        CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL,
        BORROWING_SERVICE_URL: process.env.BORROWING_SERVICE_URL,
        REVIEW_SERVICE_URL: process.env.REVIEW_SERVICE_URL,
        NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL
      }
    },
    {
      name: "user-service",
      script: "./services/user-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_USER,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "catalog-service",
      script: "./services/catalog-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_CATALOG,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "borrowing-service",
      script: "./services/borrowing-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_BORROWING,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL,
        CLOUDAMQP_URL: process.env.CLOUDAMQP_URL
      }
    },
    {
      name: "review-service",
      script: "./services/review-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_REVIEW,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL
      }
    },
    {
      name: "notification-service",
      script: "./services/notification-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_NOTIFICATION,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CLOUDAMQP_URL: process.env.CLOUDAMQP_URL,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM
      }
    }
  ]
}
```

- package.json
```ts
{
  "dependencies": {
    "dotenv": "latest",
    "pm2": "latest"
  },
  "scripts": {
    "install-all": "scripts\\install-dependencies.bat",
    "install-all-unix": "./scripts/install-dependencies.sh",
    "migrate": "scripts\\migrate-all.bat",
    "migrate-all-unix": "./scripts/migrate-all.sh",
    "start": "scripts\\start-services.bat",
    "start-all-unix": "./scripts/start-services.sh",
    "stop": "pm2 stop all",
    "restart": "pm2 restart all",
    "status": "pm2 status",
    "logs": "pm2 logs",
    "dev": "npm run migrate && npm run start"
  }
}
```

lalu buat script untuk mempermudah penginstallan pada project microservice kita

- install-dependencies
**untuk pengguna windows**
```bat
@echo off
REM scripts/install-dependencies.bat

echo Installing root dependencies...
bun install

set services=api-gateway user-service catalog-service borrowing-service review-service notification-service

for %%s in (%services%) do (
    echo Installing dependencies for %%s...
    cd services/%%s
    bun install
    cd ../..
)

echo Creating .env file from example...
if not exist .env (
    copy .env.example .env
)

echo All dependencies installed!
echo Please update your .env file with proper values before starting the services.
```

**untuk pengguna selain windows**
```sh
#!/bin/bash
# scripts/install-dependencies.sh

echo "Installing root dependencies..."
bun install

services=("api-gateway" "user-service" "catalog-service" "borrowing-service" "review-service" "notification-service")

for service in "${services[@]}"
do
    echo "Installing dependencies for $service..."
    cd "services/$service"
    bun install
    cd ../..
done

echo "Creating .env file from example..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

echo "All dependencies installed!"
echo "Please update your .env file with proper values before starting the services."
```

- migrateion database
lalu buat scripts untuk migration database schema untuk semua service

```bat
@echo off
REM scripts/migrate-all.bat

set services=user-service catalog-service borrowing-service review-service notification-service

for %%s in (%services%) do (
    echo Processing %%s...
    cd ./services/%%s
    
    REM Delete existing migration files if directory exists
    if exist "src\migrations" (
        echo Removing existing migration files in src/migrations...
        del /q "src\migrations\*"
    )
    
    echo Generating new schema...
    bun run db:generate
    
    echo Pushing migrations...
    bun run db:migrate
    
    cd ../..
    echo Completed %%s migrations
    echo ------------------------
)

echo All migrations completed!
```

```sh 
# scripts/migrate-all.sh
#!/bin/bash

# Array of services
services=("user-service" "catalog-service" "borrowing-service" "review-service" "notification-service")

# Loop through each service
for service in "${services[@]}"
do
  echo "Migrating $service..."
  cd "./services/$service"
  
  # Generate schema
  echo "Generating schema..."
  bun run db:generate
  
  # Push migrations
  echo "Pushing migrations..."
  bun run db:migrate
  
  cd ../..
  echo "Completed $service migrations"
  echo "------------------------"
done

echo "All migrations completed!"
```

setelah kalian install dependencies yang dibutuhkan
```
npm install
```

buat script lagi untuk menjalankan csemua service
```bat
@echo off
REM scripts/start-services.bat

echo Stopping any existing PM2 processes...
pm2 stop all
pm2 delete all

echo Starting services...

echo Starting API Gateway...
pm2 start ecosystem.config.js --only api-gateway
timeout /t 2

echo Starting User Service...
pm2 start ecosystem.config.js --only user-service
timeout /t 2

echo Starting Catalog Service...
pm2 start ecosystem.config.js --only catalog-service
timeout /t 2

echo Starting Borrowing Service...
pm2 start ecosystem.config.js --only borrowing-service
timeout /t 2

echo Starting Review Service...
pm2 start ecosystem.config.js --only review-service
timeout /t 2

echo Starting Notification Service...
pm2 start ecosystem.config.js --only notification-service

echo All services started!
echo Showing logs...
pm2 logs
```

lalu jalankan project dengan 
```
npm run dev
```
jika berjalan akan uncul seperti ini
![alt text](image-1.png)

jika kalian ingin melihat status server yang kalian jalankan dengan comand
```
npm run status
// atau
pm2 status
```

atau ingin memonitoring logs dari server kalian

```
pm2 monit

atau

pm2 logs
```

lalu kalian bisa langsung menggunakan project microservice ini 


# Break Code

karna kalian sudah membuat dan menjalankan project ini pasti kalian sedikit bingung karena penjalasan dan code yang sangat puanjang. oleh karna itu biar kami jelaskan sedikit hal2 yg perlu di ketahui

1. setup bun + elysia
pada dasarnya sangat mudah untuk setup project bun + elysia hanya tinggal menjalankan

```
bun create elysia app
```
ini untuk auto instalasi, tetapi jika ingin manual kalian hanya tinggal menambahkan dependencies elysia seperti ini

```
bun add elysia
bun add -d @types/bun
```
.

2. Migtration Schema / Database menggunakan Drizzle
pada pembuatan project ini kita menggunakan Drizzle sebagai ORM untuk menghubungkan project kita ke database cloud postgree di NeonDB

perlu kalian ingat bahwa arshitektur kita menggunakan Schema/Service kita ambil contoh pada user-service

```ts
// src/models/schema.ts
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

// Define schema name
const schema = 'public'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: schema
  }
})
```
pertama kalian perlu membuat schema terlebih dahulu kurang lebih seperti ini 

lalu atur config pada drizzle seperti ini

```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  dialect: "postgresql",
  schema: './src/models/*',
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  push: {
    mode: "safe" // This prevents dropping tables
  },
  defaultSchemaName: "public"
} satisfies Config
```

disini kalian mengatur config seperti dari jenis DB, letak model schema, letak output migration, dan URL pada Cloud neon db kalian

setelah itu kalian baru bisa menggenerate schema calian menggunakan command 
```
drizzle-kit generate
```

comand ini untuk menggenerate schema ke dalam bentuk sql. jika jalian melihat service kalian, di dalam ada folder bernama `migrations` di dalm folder tersebut ada file bertipe `sql` yang isinya seperti ini

```sql
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
```

itu adalah hasil generate dari schema kalian.

setelang menggenerate kalian sudah bisa push schema kalian ke dalam database yang nantinya akan menambahkan tabel dengan menjalankan

```
drizzle-kit push
```

atau kalian bisa juga membuat file migration sendiri seperti ini

```ts
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config()

const runMigration = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  const db = drizzle(sql)

  console.log('Creating schema if not exists...')
  await sql`CREATE SCHEMA IF NOT EXISTS user_service;`

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/migrations' })

  await sql.end()
  console.log('Migration completed')
}

runMigration().catch(console.error)
```

jika berhasil makan kalian akan melihat table kalian di dalam cloudDB yang kalian gunakan

3. Mailer dan RMQ (Rabit MQ)
untuk mailer kita library js yang bernama nodemailer untuk pengiriman mail. dan untuk pengirimannya kita menggunakan Message Broker dari RabbitMQ yang berfungsi sebagai penghubung untuk memastikan pesan yang dikirim oleh satu layanan dapat diterima oleh layanan lain dengan aman, bahkan jika layanan itu berjalan secara asinkron atau tidak terhubung langsung.

kalian bisa me manage RabbitMQ kalian dengan cara melihat manager UI kurang lebih akan seperti ini

![image](https://github.com/user-attachments/assets/aec13945-fc8c-473c-8b11-a4293a5d2a72)


5. API Gateway

API Gateway adalah pintu gerbang utama yang mengatur semua lalu lintas masuk dan keluar dari sistem microservices. Bayangkan seperti seorang "resepsionis" di sebuah gedung kantor besar yang mengarahkan pengunjung ke ruangan yang tepat.

dalam kasus project kita, kita menghubungkan semua service mulai dari user, catalog, borrowing, loan dan notification service ke dalam satu service untuk mempermudah developer dalam mengkonsume API

6. PM2
   
PM2 adalah alat (process manager) yang digunakan untuk mengelola aplikasi Node.js atau Bun.js yang berjalan di server. Dengan PM2, Anda dapat menjalankan, memantau, dan mengelola aplikasi dengan mudah, sehingga membuat aplikasi lebih stabil dan efisien.

Fungsi Utama PM2:
- Menjalankan Aplikasi: Menjalankan aplikasi Anda dengan satu perintah sederhana.
- Restart Otomatis: Jika aplikasi crash, PM2 akan otomatis memulai ulang.
- Load Balancing: Membagi beban aplikasi dengan menjalankan beberapa instance (cluster mode).
- Pemantauan: Memantau penggunaan CPU, memori, dan status aplikasi secara real-time.
- Logging: Menyimpan log aktivitas aplikasi untuk debugging dan analisis.

dalam kasus kita, kita menggunakan PM2 agar mudah memonitoring semua service jang sedang berjalan pada project kita. jika kita menemukan suatu error pada service tertentu maka akan mempermudah pengecekan dan memaintance service tertentu yang mengalami masalah tanpa harus mematikan semua service.

![image](https://github.com/user-attachments/assets/6cba06d6-ff11-4763-9423-98b8e48d4d79)

![image](https://github.com/user-attachments/assets/e396e981-8270-4afe-9dea-04c7d94ffee9)


