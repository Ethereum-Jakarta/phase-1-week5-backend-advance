// src/services/bookService.ts
import { eq, like, sql  } from 'drizzle-orm'
import { db } from '../config/database'
import { books } from '../models/schema'

export class BookService {
  async createBook(bookData: any) {
    try {
        const book = await db.insert(books).values(bookData).returning();
        return book;
    } catch (error) {
        console.error('Error in createBook:', error);
        throw new Error('Failed to create book');
    }
  }

  async getBooks(page: number = 1, limit: number = 10, search?: string) {
    try {
        const offset = (page - 1) * limit;
        let query = db.select().from(books).limit(limit).offset(offset);

        if (search) {
            query = query.where(like(books.title, `%${search}%`));
        }

        const [data, total] = await Promise.all([
            query,
            db.select({ count: sql<number>`count(*)` }).from(books).then(res => Number(res[0].count)),
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Error in getBooks:', error);
        throw new Error('Failed to fetch books');
    }
  }

  async getBookById(id: number) {
    try {
        const book = await db.select().from(books).where(eq(books.id, id)).limit(1);
        if (!book.length) throw new Error('Book not found');
        return book[0];
    } catch (error) {
        console.error('Error in getBookById:', error);
        throw new Error('Failed to fetch book');
    }
  }

  async updateBook(id: number, bookData: any) {
    try {
        const updatedBook = await db.update(books)
            .set(bookData)
            .where(eq(books.id, id))
            .returning();
        return updatedBook;
    } catch (error) {
        console.error('Error in updateBook:', error);
        throw new Error('Failed to update book');
    }
  }

  async deleteBook(id: number) {
    try {
        const deletedBook = await db.delete(books)
            .where(eq(books.id, id))
            .returning();
        return deletedBook;
    } catch (error) {
        console.error('Error in deleteBook:', error);
        throw new Error('Failed to delete book');
    }
  }

  async updateBookCopies(id: number, action: 'borrow' | 'return') {
    try {
        const book = await this.getBookById(id);

        if (action === 'borrow' && book.availableCopies < 1) {
            throw new Error('No copies available');
        }

        const availableCopies = action === 'borrow'
            ? book.availableCopies - 1
            : book.availableCopies + 1;

        const updatedBook = await this.updateBook(id, { availableCopies });
        return updatedBook;
    } catch (error) {
        console.error('Error in updateBookCopies:', error);
        throw new Error('Failed to update book copies');
    }
  }

}