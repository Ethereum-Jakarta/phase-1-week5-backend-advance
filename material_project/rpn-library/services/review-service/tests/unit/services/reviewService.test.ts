// tests/unit/services/reviewService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ReviewService } from '../../../src/services/reviewService';
import { eq } from 'drizzle-orm';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
    process.env.CATALOG_SERVICE_URL = 'http://localhost:3002';

    // Mock the database with proper chainable queries
    mock.module('../../../src/config/database', () => ({
      db: {
        select: () => {
          const chainableQuery = {
            from: () => chainableQuery,
            where: () => chainableQuery,
            limit: () => [],
            offset: () => chainableQuery,
            orderBy: () => chainableQuery,
            returning: () => [{
              id: 1,
              userId: 1,
              bookId: 1,
              rating: 4,
              comment: 'Test review',
              averageRating: 4.0,
              totalReviews: 1
            }]
          };
          return chainableQuery;
        },
        insert: () => ({
          values: () => ({
            returning: () => [{
              id: 1,
              userId: 1,
              bookId: 1,
              rating: 4,
              comment: 'Test review',
              createdAt: new Date(),
              updatedAt: new Date()
            }]
          })
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => [{
                id: 1,
                userId: 1,
                bookId: 1,
                rating: 5,
                comment: 'Updated review'
              }]
            })
          })
        }),
        delete: () => ({
          where: () => true
        })
      }
    }));

    // Mock fetch global
    global.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ 
        id: 1,
        averageRating: 4.0,
        totalReviews: 1
      })
    } as Response));
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const chainableQuery = {
        from: () => chainableQuery,
        where: () => chainableQuery,
        limit: () => [],
        offset: () => chainableQuery,
        orderBy: () => chainableQuery,
        returning: () => [{
          id: 1,
          userId: 1,
          bookId: 1,
          rating: 4,
          comment: 'Test review'
        }]
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery,
          insert: () => ({
            values: () => ({
              returning: () => [{
                id: 1,
                userId: 1,
                bookId: 1,
                rating: 4,
                comment: 'Test review',
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            })
          })
        }
      }));

      const result = await reviewService.createReview({
        userId: 1,
        bookId: 1,
        rating: 4,
        comment: 'Test review'
      });

      expect(result).toHaveProperty('id');
      expect(result.rating).toBe(4);
    });
  });

  describe('getBookReviews', () => {
    it('should return paginated book reviews', async () => {
      const mockReviews = [
        { id: 1, rating: 4, comment: 'Great!' },
        { id: 2, rating: 5, comment: 'Amazing!' }
      ];

      const chainableQuery = {
        from: () => chainableQuery,
        where: () => chainableQuery,
        limit: () => chainableQuery,
        offset: () => chainableQuery,
        orderBy: () => mockReviews,
        then: (cb: any) => cb([{ count: '2' }])
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery
        }
      }));

      const result = await reviewService.getBookReviews(1);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getUserReviews', () => {
    it('should return user reviews', async () => {
      const mockReviews = [
        { id: 1, userId: 1, rating: 4 },
        { id: 2, userId: 1, rating: 5 }
      ];

      const chainableQuery = {
        from: () => chainableQuery,
        where: () => mockReviews
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => chainableQuery
        }
      }));

      const result = await reviewService.getUserReviews(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateReview', () => {
    it('should update review successfully', async () => {
      const mockReview = {
        id: 1,
        userId: 1,
        bookId: 1,
        rating: 4
      };

      const selectQuery = {
        from: () => selectQuery,
        where: () => selectQuery,
        limit: () => [mockReview]
      };

      const updateQuery = {
        set: () => ({
          where: () => ({
            returning: () => [{
              ...mockReview,
              rating: 5,
              comment: 'Updated review'
            }]
          })
        })
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => selectQuery,
          update: () => updateQuery
        }
      }));

      const result = await reviewService.updateReview(1, 1, {
        rating: 5,
        comment: 'Updated review'
      });

      expect(result.rating).toBe(5);
    });
  });

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      const selectQuery = {
        from: () => selectQuery,
        where: () => selectQuery,
        limit: () => [{
          id: 1,
          userId: 1,
          bookId: 1
        }]
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => selectQuery,
          delete: () => ({
            where: () => true
          })
        }
      }));

      const result = await reviewService.deleteReview(1, 1);
      expect(result.message).toBe('Review deleted successfully');
    });
  });
});