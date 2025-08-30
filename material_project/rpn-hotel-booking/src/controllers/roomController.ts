// src/controllers/roomController.ts
import { Elysia, t } from 'elysia';
import { RoomService } from '../services/roomService';
import { RoomSchema, CreateRoomSchema } from '../types';

const RoomResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  pricePerNight: t.Number(),
  capacity: t.Number(),
  roomNumber: t.String(),
  floorNumber: t.String(),
  facilities: t.Array(t.Any()),
  isAvailable: t.Boolean(),
  createdAt: t.Any(),
  updatedAt: t.Any()
});

const createRoomBody = t.Object({
  name: t.String(),
  description: t.String(),
  pricePerNight: t.Union([t.String(), t.Number()]), // Accept both string and number
  capacity: t.Union([t.String(), t.Number()]), // Accept both string and number
  facilityIds: t.Array(t.String()),
  roomNumber: t.String(),
  floorNumber: t.String()
});

export const roomController = new Elysia({ prefix: '/api/rooms' })
  .decorate('roomService', new RoomService())
  .get('/', async ({ roomService }) => {
    try {
      const rooms = await roomService.getAllRooms();
      return { status: 'success', data: rooms };
    } catch (error: any) {
      console.error('Error getting rooms:', error);
      throw new Error('Failed to fetch rooms');
    }
  })
  .get('/:id', async ({ params: { id }, roomService }) => {
    try {
      const room = await roomService.getRoomById(id);
      if (!room) {
        throw new Error('Room not found');
      }
      return { status: 'success', data: room };
    } catch (error: any) {
      console.error('Error getting room:', error);
      throw new Error(`Failed to fetch room: ${error.message}`);
    }
  })
  .post('/', async ({ body, roomService }) => {
    try {
      // Convert string values to numbers
      const processedBody = {
        ...body,
        pricePerNight: Number(body.pricePerNight),
        capacity: Number(body.capacity)
      };

      // Validate the numbers
      if (isNaN(processedBody.pricePerNight)) {
        throw new Error('Invalid price per night');
      }
      if (isNaN(processedBody.capacity)) {
        throw new Error('Invalid capacity');
      }

      const room = await roomService.createRoom(processedBody);
      return {
        status: 'success',
        data: room
      };
    } catch (error: any) {
      console.error('Controller error:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }, {
    body: createRoomBody
  })
  .patch('/:id/availability', async ({ params: { id }, body, roomService }: any) => {
    const room = await roomService.updateRoomAvailability(id, body.isAvailable);
    if (!room) throw new Error('Room not found');
    return room;
  }, {
    body: t.Object({
      isAvailable: t.Boolean()
    }),
    response: RoomSchema
  });