import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { theaters, Theaters } from '../db/schema';

export class TheatersService {

  async getAllTheaters(): Promise<Theaters[]> {
    try {
      const theater = await db.select().from(theaters);
      return theater;
    } catch (error) { 
      console.error('Error in getAllTheaters:', error);
      throw error;
    }
  }

  async getTheaterById(id: string): Promise<Theaters> {
    try {
      const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
      return theater;
    } catch (error) {
      console.error('Error in getTheaterById:', error);
      throw error;
    }
  }

  async createTheater(theaterData: any) {
    try {
      const theater = await db.insert(theaters).values(theaterData).returning();
      return theater;
    } catch (error) {
      console.error('Error in createTheater:', error);
      throw error;
    }
  }

  async updateTheater(id: string, theaterData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedTheater] = await db.update(theaters)
        .set(theaterData)
        .where(eq(theaters.id, id))
        .returning();

      if (!updatedTheater) {
        console.warn(`Theater not found with ID: ${id}`);
        throw new Error('Failed to update theater');
      }

      return updatedTheater; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateTheater:', error);
      throw error;
    }
}

  async deleteTheater(id: string) {
    try {
      const [deletedTheater] = await db.delete(theaters).where(eq(theaters.id, id)).returning();
      if (!deletedTheater) {
        console.warn(`Theater not found with ID: ${id}`);
        throw new Error('Theater not found');
      }
      return deletedTheater;
    } catch (error) {
      console.error('Error in deleteTheater:', error);
      throw error;
    }
  }

}