import { db } from '../db/client';
import { eq, sql } from 'drizzle-orm';
import { movieSchedules, MovieSchedules, movies } from '../db/schema';

export class ScheduleServices {

  async getMovieSchedulesById(id: string): Promise<any> {
    try {
      
      const [movieSchedule] = await db.select().from(movieSchedules).leftJoin(movies, eq(movieSchedules.movieId, movies.id))
      .where(eq(movieSchedules.id, id));
      
      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieSchedulesByMovieId:', error);
      throw error;
    }
  }
  async getMovieSchedulesByMovieId(movieId: string): Promise<MovieSchedules[]> {
    try {
      const movieSchedule = await db.select().from(movieSchedules).where(eq(movieSchedules.movieId, movieId));
      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieSchedulesByMovieId:', error);
      throw error;
    }
  }

  async createMovieSchedule(movieScheduleData: MovieSchedules): Promise<MovieSchedules> {
    try {

      const [movie] = await db.select().from(movies).where(eq(movies.id, movieScheduleData.movieId));
      if (!movie) {
        throw new Error('Movie not found');
      }

      const theaterResponse = await fetch(`${process.env.THEATER_SERVICE_URL}/${movieScheduleData.theaterId}`);
      if (!theaterResponse.ok) {
        return Promise.reject(theaterResponse);
      }
    
      const theaterData = await theaterResponse.json().catch(() => null);

      if (theaterData.totalScreens < movieScheduleData.screenNumber) {
        throw new Error('Theres no screen at that number in this theater');
      }
      
      const [movieSchedule] = await db.insert(movieSchedules).values(movieScheduleData).returning();
      
      return {...movieSchedule};
    } catch (error) {
      console.error('Error in createMovieSchedule:', error);
      throw error;
    }
  }

  async deleteMovieSchedule(id: string) {
    try {
      const [deletedMovieSchedule] = await db.delete(movieSchedules).where(eq(movieSchedules.id, id)).returning();
      if (!deletedMovieSchedule) {
        console.warn(`Movie Schedule not found with ID: ${id}`);
        throw new Error('Movie Schedule not found');
      }
      return deletedMovieSchedule;
    } catch (error) {
      console.error('Error in deleteMovieSchedule:', error);
      throw error;
    }
  } 

  async updateMovieSchedule(id: string, movieScheduleData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedMovieSchedule] = await db.update(movieSchedules)
        .set(movieScheduleData)
        .where(eq(movieSchedules.id, id))
        .returning();
  
      if (!updatedMovieSchedule) {
        console.warn(`Movie Schedule not found with ID: ${id}`);
        throw new Error('Failed to update movie schedule');
      }
  
      return updatedMovieSchedule; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateMovieSchedule:', error);
      throw error;
    }
  } 

  async getAllMovieSchedules(): Promise<MovieSchedules[]> {
    try {
      const movieSchedule = await db.select().from(movieSchedules);
      return movieSchedule;
    } catch (error) {
      console.error('Error in getAllMovieSchedules:', error);
      throw error;
    }
  }

  

  async getMovieScheduleByDate(date: Date): Promise<MovieSchedules[]> {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // ✅ Extract YYYY-MM-DD format

      const movieSchedule = await db
        .select()
        .from(movieSchedules)
        .where(sql`DATE(${movieSchedules.startTime}) = ${formattedDate}`);

      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieScheduleByDate:', error);
      throw error;
    }
  }


  async getMovieSchedulesByTheaterId(theaterId: string): Promise<MovieSchedules[]> {
    try {
      const movieSchedule = await db.select().from(movieSchedules).where(eq(movieSchedules.theaterId, theaterId));
      return movieSchedule;
    } catch (error) {
      console.error('Error in getMovieSchedulesByTheaterId:', error);
      throw error;
    }
  }
}