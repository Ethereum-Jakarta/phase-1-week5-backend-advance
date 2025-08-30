// src/swagger/schemas/facility.ts
export const facilitySchemas = {
  Facility: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateFacilityRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { 
        type: 'string',
        example: 'WiFi',
        description: 'Name of the facility'
      },
      description: { 
        type: 'string',
        example: 'High-speed wireless internet',
        description: 'Detailed description of the facility'
      }
    }
  }
};