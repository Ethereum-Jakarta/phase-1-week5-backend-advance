// src/swagger/schemas/customer.ts
export const customerSchemas = {
  Customer: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      address: { type: 'string' },
      idNumber: { type: 'string' },
      idType: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateCustomerRequest: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { 
        type: 'string',
        example: 'John Doe',
        description: 'Full name of the customer'
      },
      email: { 
        type: 'string',
        format: 'email',
        example: 'john@example.com',
        description: 'Email address (must be unique)'
      },
      phone: { 
        type: 'string',
        example: '+1234567890',
        description: 'Contact phone number'
      },
      address: { 
        type: 'string',
        example: '123 Main St, City, Country',
        description: 'Physical address'
      },
      idNumber: { 
        type: 'string',
        example: 'AB123456',
        description: 'Government-issued ID number'
      },
      idType: { 
        type: 'string',
        example: 'passport',
        description: 'Type of ID provided (passport, national ID, etc.)'
      }
    }
  }
};