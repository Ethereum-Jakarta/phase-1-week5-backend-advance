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
                required: ['id'],
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
  
