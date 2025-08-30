// src/swagger/config.ts
import { OpenAPIV3 } from "openapi-types";

// @ts-ignore
export const swaggerConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Hotel Booking API',
    version: '1.0.0',
    description: `
# Hotel Booking System API

This API provides comprehensive endpoints for managing a hotel booking system. It includes room management, customer profiles, booking operations, and payment processing via Stripe.

## Key Features
- Room and facility management
- Customer profile handling
- Booking system with availability checking
- Secure payment processing
- Real-time webhook handling
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://example.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.example.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'rooms',
      description: 'Room management operations'
    },
    {
      name: 'facilities',
      description: 'Hotel facility management'
    },
    {
      name: 'customers',
      description: 'Customer profile management'
    },
    {
      name: 'bookings',
      description: 'Booking operations'
    },
    {
      name: 'payments',
      description: 'Payment processing'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};