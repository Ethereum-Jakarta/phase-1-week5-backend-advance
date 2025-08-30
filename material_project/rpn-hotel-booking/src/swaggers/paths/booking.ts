// src/swagger/paths/booking.ts
export const bookingPaths = {
  '/api/bookings': {
    get: {
      tags: ['bookings'],
      summary: 'Get all bookings',
      description: 'Get list of all bookings with optional filtering and pagination',
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['pending', 'paid', 'failed', 'cancelled']
          }
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'number' }
        },
        {
          name: 'offset',
          in: 'query',
          schema: { type: 'number' }
        }
      ],
      responses: {
        200: {
          description: 'List of bookings retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      bookings: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Booking' }
                      },
                      total: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['bookings'],
      summary: 'Create a new booking',
      description: 'Create a new room booking and initialize payment process',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BookingRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Booking created successfully with payment link',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: {
                    type: 'object',
                    properties: {
                      booking: { $ref: '#/components/schemas/BookingStatus' },
                      checkoutUrl: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/bookings/{id}/status': {
    get: {
      tags: ['bookings'],
      summary: 'Get booking status',
      description: 'Get the current status of a booking including payment status',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Booking status retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: { $ref: '#/components/schemas/BookingStatus' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/bookings/{id}/payment-link': {
    get: {
      tags: ['bookings'],
      summary: 'Get payment link',
      description: 'Get or regenerate payment link for a pending booking',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Payment link retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: {
                    type: 'object',
                    properties: {
                      checkoutUrl: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/bookings/customer/{email}': {
    get: {
      tags: ['bookings'],
      summary: 'Get customer bookings',
      description: 'Get all bookings for a specific customer by email',
      parameters: [
        {
          name: 'email',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'Customer bookings retrieved successfully'
        }
      }
    }
  },
  '/api/bookings/room/{roomId}': {
    get: {
      tags: ['bookings'],
      summary: 'Get room bookings',
      description: 'Get all bookings for a specific room',
      parameters: [
        {
          name: 'roomId',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'Room bookings retrieved successfully'
        }
      }
    }
  },
  '/api/bookings/{id}/cancel': {
    post: {
      tags: ['bookings'],
      summary: 'Cancel booking',
      description: 'Cancel an existing booking with optional reason',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                reason: {
                  type: 'string',
                  description: 'Reason for cancellation'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Booking cancelled successfully'
        },
        400: {
          description: 'Invalid request or booking cannot be cancelled'
        },
        404: {
          description: 'Booking not found'
        }
      }
    }
  }
};