// src/services/roomService.ts
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { rooms } from '../db/schema';
import { FacilityService } from './facilityService';
import type { Room } from '../types';

export class RoomService {
  private facilityService: FacilityService;

  constructor() {
    this.facilityService = new FacilityService();
  }

  async createRoom(data: {
    name: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    facilityIds: string[];
    roomNumber: string;
    floorNumber: string;
  }): Promise<Room> {
    try {
      // Get facility details
      let facilityDetails = [];
      if (data.facilityIds && data.facilityIds.length > 0) {
        const facilities = await this.facilityService.getFacilitiesByIds(data.facilityIds);
        facilityDetails = facilities.map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description
        }));
      }

      // Create room with facilities
      const [room] = await db
        .insert(rooms)
        .values({
          name: data.name,
          description: data.description,
          pricePerNight: data.pricePerNight,
          capacity: data.capacity,
          roomNumber: data.roomNumber,
          floorNumber: data.floorNumber,
          facilities: facilityDetails, // Store facility details in JSONB
          isAvailable: true
        })
        .returning();

      return room;
    } catch (error: any) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async getAllRooms(): Promise<Room[]> {
    try {
      return await db.select().from(rooms);
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch rooms from database');
    }
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    try {
      const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, id));
      return room;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch room from database');
    }
  }

  async updateRoomAvailability(id: string, isAvailable: boolean): Promise<Room | undefined> {
    const [room] = await db
      .update(rooms)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }
}