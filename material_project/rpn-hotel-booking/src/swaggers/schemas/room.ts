// src/swagger/schemas/room.ts
export const roomSchemas = {
  Room: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' },
      pricePerNight: { type: 'number' },
      capacity: { type: 'integer' },
      facilities: {
        type: 'array',
        items: { $ref: '#/components/schemas/Facility' }
      },
      isAvailable: { type: 'boolean' },
      roomNumber: { type: 'string' },
      floorNumber: { type: 'string' }
    }
  },
  CreateRoomRequest: {
    type: 'object',
    required: ['name', 'pricePerNight', 'capacity', 'roomNumber', 'floorNumber'],
    properties: {
      name: { type: 'string', example: 'Deluxe Suite' },
      description: { type: 'string', example: 'Luxurious suite with city view' },
      pricePerNight: { type: 'number', example: 200 },
      capacity: { type: 'integer', example: 2 },
      facilityIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' }
      },
      roomNumber: { type: 'string', example: '301' },
      floorNumber: { type: 'string', example: '3' }
    }
  }
};