import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { seats, Seats } from '../db/schema';

function isValidSeatCode(seatCode: string): boolean {
  return /^[A-G](1[0-5]|[1-9])$/.test(seatCode);
}

export class ReservationsService {
  async getSeatById(id: string): Promise<Seats> {
    try {
      const [seat] = await db.select().from(seats).where(eq(seats.id, id));
      return seat;
    } catch (error) {
      console.error('Error in getSeatById:', error);
      throw error;
    }
  }

  async getSeatByTheaterId(id: string): Promise<Seats[]> {
    try {
      const seat = await db.select().from(seats).where(eq(seats.movieScheduleId, id));
      return seat;
    } catch (error) {
      console.error('Error in getSeatById:', error);
      throw error;
    }
  }

  async getAllSeats(): Promise<Seats[]> {
    try {
      const seat = await db.select().from(seats);
      return seat;
    } catch (error) {
      console.error('Error in getAllSeats:', error);
      throw error;
    }
  }

  async createSeat(seatData: any) {
    try {
      if (!isValidSeatCode(seatData.seatCode)) {
        throw new Error('Seat code only from A1 - G15');
      }
      const seat = await db.insert(seats).values(seatData).returning();
      return seat;
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('Seat with this seatCode already exists for this screenNumber');
    }
    console.error('Error in createSeat:', error);
    throw error;
    }
  }

  async updateSeat(id: string, seatData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {

      if (!isValidSeatCode(seatData.seatCode)) {
        throw new Error('Seat code only from A1 - G15');
      }

      const [updatedSeat] = await db.update(seats)
        .set(seatData)
        .where(eq(seats.id, id))
        .returning();

      if (!updatedSeat) {
        console.warn(`Seat not found with ID: ${id}`);
        throw new Error('Failed to update seat');
      }

      return updatedSeat; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateSeat:', error);
      throw error;
    }
  }

  async updateSeatStatus(id: string) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {

      const [updatedSeat] = await db.update(seats)
        .set({ status: 'booked' })
        .where(eq(seats.id, id))
        .returning();

      if (!updatedSeat) {
        console.warn(`Seat not found with ID: ${id}`);
        throw new Error('Failed to update seat');
      }

      return updatedSeat.status; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateSeat:', error);
      throw error;
    }
  }

  async deleteSeat(id: string) {
    try {
      const [deletedSeat] = await db.delete(seats).where(eq(seats.id, id)).returning();
      if (!deletedSeat) {
        console.warn(`Seat not found with ID: ${id}`);
        throw new Error('Seat not found');
      }
      return deletedSeat;
    } catch (error) {
      console.error('Error in deleteSeat:', error);
      throw error;
    }
  }



}