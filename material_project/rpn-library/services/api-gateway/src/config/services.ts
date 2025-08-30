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