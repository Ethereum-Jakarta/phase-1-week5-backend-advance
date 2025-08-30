// src/swagger/paths/room.ts
export const roomPaths = {
  '/api/rooms': {
    get: {
      tags: ['rooms'],
      summary: 'List all rooms',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of rooms',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Room' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['rooms'],
      summary: 'Create a new room',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateRoomRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Room created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Room' }
            }
          }
        }
      }
    }
  }
};