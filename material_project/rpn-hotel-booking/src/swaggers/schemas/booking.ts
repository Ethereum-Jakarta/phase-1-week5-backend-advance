export const bookingSchemas = {
  BookingRequest: {
    type: 'object',
    required: ['roomId', 'guestName', 'guestEmail', 'checkIn', 'checkOut', 'numberOfGuests'],
    properties: {
      roomId: { type: 'string', format: 'uuid' },
      guestName: { type: 'string' },
      guestEmail: { type: 'string', format: 'email' },
      checkIn: { type: 'string', format: 'date' },
      checkOut: { type: 'string', format: 'date' },
      numberOfGuests: { type: 'integer', minimum: 1 },
      specialRequests: { type: 'string' }
    }
  },
  BookingStatus: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      guestName: { type: 'string' },
      paymentStatus: { 
        type: 'string',
        enum: ['pending', 'paid', 'failed']
      },
      checkIn: { type: 'string', format: 'date-time' },
      checkOut: { type: 'string', format: 'date-time' },
      totalPrice: { type: 'number' }
    }
  }
};