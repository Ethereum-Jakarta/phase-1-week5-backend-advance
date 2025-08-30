// src/swagger/paths/facility.ts
export const facilityPaths = {
  '/api/facilities': {
    get: {
      tags: ['facilities'],
      summary: 'List all facilities',
      description: 'Retrieve a list of all available hotel facilities',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of facilities',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Facility' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['facilities'],
      summary: 'Create a new facility',
      description: 'Add a new facility to the hotel',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateFacilityRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Facility created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Facility' }
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
                error: 'Facility name is required'
              }
            }
          }
        }
      }
    }
  }
};