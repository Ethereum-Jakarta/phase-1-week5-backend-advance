// tests/unit/services/bookService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { BookService } from '../../../src/services/bookService';

describe('BookService', () => {
  let bookService: BookService;

  beforeEach(() => {
    bookService = new BookService();
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        totalCopies: 5,
        availableCopies: 5
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{ id: 1, ...bookData }]
            })
          })
        }
      }));

      const result = await bookService.createBook(bookData);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].title).toBe(bookData.title);
    });

    it('should throw error on create book failure', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => {
            throw new Error('Database error');
          }
        }
      }));

      await expect(bookService.createBook({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        totalCopies: 5,
        availableCopies: 5
      })).rejects.toThrow('Failed to create book');
    });
  });

  describe('getBooks', () => {
    it('should return books with pagination', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1' },
        { id: 2, title: 'Book 2', author: 'Author 2' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              limit: () => ({
                offset: () => mockBooks
              })
            })
          }),
          select: () => ({
            from: () => [{
              count: '2'
            }]
          })
        }
      }));

      const result = await bookService.getBooks(1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should handle search parameter', async () => {
      const mockBooks = [
        { id: 1, title: 'Specific Book' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => ({
                  offset: () => mockBooks
                })
              })
            })
          }),
          select: () => ({
            from: () => [{
              count: '1'
            }]
          })
        }
      }));

      const result = await bookService.getBooks(1, 10, 'Specific');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getBookById', () => {
    it('should return a book by id', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockBook]
              })
            })
          })
        }
      }));

      const result = await bookService.getBookById(1);
      expect(result).toEqual(mockBook);
    });

    
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const updateData = {
        title: 'Updated Book',
        author: 'Updated Author'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{ id: 1, ...updateData }]
              })
            })
          })
        }
      }));

      const result = await bookService.updateBook(1, updateData);
      expect(result[0].title).toBe(updateData.title);
    });

    it('should throw error on update failure', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => {
            throw new Error('Update failed');
          }
        }
      }));

      await expect(bookService.updateBook(1, { title: 'New Title' }))
        .rejects.toThrow('Failed to update book');
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          delete: () => ({
            where: () => ({
              returning: () => [{ id: 1 }]
            })
          })
        }
      }));

      const result = await bookService.deleteBook(1);
      expect(result[0]).toHaveProperty('id');
    });

    it('should throw error on delete failure', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          delete: () => {
            throw new Error('Delete failed');
          }
        }
      }));

      await expect(bookService.deleteBook(1))
        .rejects.toThrow('Failed to delete book');
    });
  });

  describe('updateBookCopies', () => {
    it('should update available copies when borrowing', async () => {
      const mockBook = {
        id: 1,
        availableCopies: 2
      };

      // Mock getBookById
      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockBook]
              })
            })
          }),
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{ ...mockBook, availableCopies: 1 }]
              })
            })
          })
        }
      }));

      const result = await bookService.updateBookCopies(1, 'borrow');
      expect(result[0].availableCopies).toBe(1);
    });

    
  });
});