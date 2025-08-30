import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { movies, Movies } from '../db/schema';


 export class MoviesServices {
  async getMovies(): Promise<Movies[]> {
    try {
      const moviesList = await db.select().from(movies);
      return moviesList;
    } catch (error) {
      console.error('Error in getMovies:', error);
      throw error;
    }
  }

  async getMovieById(id: string): Promise<Movies> {
    try {
      const [movie] = await db.select().from(movies).where(eq(movies.id, id));
      return movie;
    } catch (error) {
      console.error('Error in getMovieById:', error);
      throw error;
    }
  }

  async createMovie(movieData: any) {
    try {
      const [movie] = await db.insert(movies).values(movieData).returning();
      return movie;
    } catch (error) {
      console.error('Error in createMovie:', error);
      throw error;
    }
  }

  async updateMovie(id: string, movieData: Partial<any>) { // Gunakan Partial untuk mendukung pembaruan sebagian
    try {
      const [updatedMovie] = await db.update(movies)
        .set(movieData)
        .where(eq(movies.id, id))
        .returning(); // Mengembalikan data yang diperbarui 

      if (!updatedMovie) {
        throw new Error('Movie not found');
      }

      return updatedMovie; // Kembalikan data yang diperbarui
    } catch (error) {
      console.error('Error in updateMovie:', error);
      throw error;
    }
  }

  async deleteMovie(id: string) {
    try {
      const [deletedMovie] = await db.delete(movies).where(eq(movies.id, id)).returning();
      if (!deletedMovie) {
        throw new Error('Movie not found');
      }
      return deletedMovie;
    } catch (error) {
      console.error('Error in deleteMovie:', error);
      throw error;
    }
  }

}