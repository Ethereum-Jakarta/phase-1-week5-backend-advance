// src/services/reviewService.ts
import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { reviews } from '../models/schema'

export class ReviewService {
  async createReview(reviewData: any) {
    // Check if user already reviewed this book
    try {
      const existingReview = await db.select()
        .from(reviews)
        .where(eq(reviews.userId, reviewData.userId))
        .where(eq(reviews.bookId, reviewData.bookId))
        .limit(1);
      
      // Check book availability from catalog service
      const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${reviewData.bookId}`)
      
      if (!bookResponse.ok) { 
        // Handle non-200 response (e.g., 404 Book not found)
        const errorMessage = await bookResponse.json();
        throw new Error(errorMessage.message || 'Error fetching book data');
      }
    
      if (existingReview.length) {
        throw new Error('User already reviewed this book');
      }
    
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
    
      const review = await db.insert(reviews)
        .values(reviewData)
        .returning();
    
      await this.updateBookAverageRating(reviewData.bookId);
    
      return review[0];
    } catch (error: any) {
      console.error(error);
      throw new Error('Error creating review: ' + error.message);
    }
  }

  async getBookReviews(bookId: number, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
  
      const [data, total] = await Promise.all([
        db.select()
          .from(reviews)
          .where(eq(reviews.bookId, bookId))
          .limit(limit)
          .offset(offset)
          .orderBy(reviews.createdAt),
        db.select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.bookId, bookId))
          .then(res => Number(res[0].count))
      ]);
  
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      console.error(error);
      throw new Error('Error fetching book reviews: ' + error.message);
    }
  }

  async getUserReviews(userId: number) {
    try {
      return await db.select()
        .from(reviews)
        .where(eq(reviews.userId, userId));
    } catch (error: any) {
      console.error(error);
      throw new Error('Error fetching user reviews: ' + error.message);
    }
  }

  async updateReview(id: number, userId: number, data: any) {
    try {
      const review = await db.select()
        .from(reviews)
        .where(eq(reviews.id, id))
        .limit(1);
  
      if (!review.length || review[0].userId !== userId) {
        throw new Error('Review not found or unauthorized');
      }
  
      if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }
  
      const updatedReview = await db.update(reviews)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(reviews.id, id))
        .returning();
  
      if (data.rating) {
        await this.updateBookAverageRating(review[0].bookId);
      }
  
      return updatedReview[0];
    } catch (error: any) {
      console.error(error);
      throw new Error('Error updating review: ' + error.message);
    }
  }

  async deleteReview(id: number, userId: number) {
    try {
      const review = await db.select()
        .from(reviews)
        .where(eq(reviews.id, id))
        .limit(1);
  
      if (!review.length || review[0].userId !== userId) {
        throw new Error('Review not found or unauthorized');
      }
  
      await db.delete(reviews)
        .where(eq(reviews.id, id));
  
      await this.updateBookAverageRating(review[0].bookId);
  
      return { message: 'Review deleted successfully' };
    } catch (error: any) {
      console.error(error);
      throw new Error('Error deleting review: ' + error.message);
    }
  }

  private async updateBookAverageRating(bookId: number) {
    try {
      const chainableQuery = {
        from: () => chainableQuery,
        where: () => [{
          averageRating: 4.0,
          totalReviews: 1
        }]
      };
  
      // Get average rating and total reviews
      const result = await db.select({
        averageRating: sql<number>`AVG(rating)::numeric(2,1)`,
        totalReviews: sql<number>`COUNT(*)`
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));
  
      // If there are no reviews, set defaults
      const averageRating = result[0]?.averageRating || 0;
      const totalReviews = result[0]?.totalReviews || 0;
  
      // Update book in catalog service
      await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          averageRating,
          totalReviews
        })
      });
    } catch (error: any) {
      console.error(error);
      throw new Error('Error updating book average rating: ' + error.message);
    }
  }
}