// src/swagger/paths/customer.ts
export const customerPaths = {
  '/api/customers': {
    get: {
      tags: ['customers'],
      summary: 'List all customers',
      description: 'Retrieve a list of all registered customers',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of customers',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Customer' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['customers'],
      summary: 'Create a new customer',
      description: 'Register a new customer in the system',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateCustomerRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Customer created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Customer' }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' }
                }
              },
              example: {
                error: 'Email already exists'
              }
            }
          }
        }
      }
    }
  },
  '/api/customers/{id}': {
    get: {
      tags: ['customers'],
      summary: 'Get customer details',
      description: 'Retrieve detailed information about a specific customer',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Customer ID'
        }
      ],
      responses: {
        '200': {
          description: 'Customer details retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Customer' }
            }
          }
        },
        '404': {
          description: 'Customer not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' }
                }
              },
              example: {
                error: 'Customer not found'
              }
            }
          }
        }
      }
    }
  }
};