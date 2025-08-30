// src/services/facilityService.ts
import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { facilities } from '../db/schema';
import type { Facility } from '../types';

export class FacilityService {
  async getAllFacilities(): Promise<Facility[]> {
    return await db.select().from(facilities);
  }

  async getFacilityById(id: string): Promise<Facility | undefined> {
    const [facility] = await db
      .select()
      .from(facilities)
      .where(eq(facilities.id, id));
    return facility;
  }

  async createFacility(data: { name: string; description?: string }): Promise<Facility> {
    const [facility] = await db
      .insert(facilities)
      .values(data)
      .returning();
    return facility;
  }

  async getFacilitiesByIds(ids: string[]): Promise<Facility[]> {
    try {
      const facilityList = await db
        .select()
        .from(facilities)
        .where(sql`${facilities.id} IN ${ids}`);
      return facilityList;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw new Error('Failed to fetch facilities');
    }
  }
}