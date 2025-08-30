// src/services/loanService.ts
import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { loans } from '../models/schema'
import { getChannel } from '../config/amqp'

export class LoanService {
  async createLoan(loanData: any) {
    try {
      // Set due date to 14 days from borrow date
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)

      // Check book availability from catalog service
      const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loanData.bookId}`)
      
      if (!bookResponse.ok) { 
          // Handle non-200 response (e.g., 404 Book not found)
          const errorMessage = await bookResponse.json();
          throw new Error(errorMessage.message || 'Error fetching book data');
      }
      
      const book = await bookResponse.json();

      if (!book || book.availableCopies < 1) {
          throw new Error('Book not available');
      }

      const channel = await getChannel()
        await channel.sendToQueue('loan.due', Buffer.from(JSON.stringify({
            userId: loanData.userId,
            bookId: loanData.bookId,
            dueDate
        })))

      // Create loan
      const loan = await db.insert(loans)
        .values({
          ...loanData,
          dueDate,
          status: 'ACTIVE'
        })
        .returning()

      // Update book availability in catalog service
      await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loanData.bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            availableCopies: book.availableCopies - 1
          })
      });

      return loan[0];
    } catch (error) {
      console.error('Error in createLoan:', error);
      throw error; // Propagate the error for further handling
    }
  }


  async getAllLoans(page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;
        let query = db.select().from(loans).limit(limit).offset(offset);

        const [data, total] = await Promise.all([
            query,
            db.select({ count: sql<number>`count(*)` }).from(loans).then(res => Number(res[0].count)),
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Error in getAllLoans:', error);
        throw new Error('Failed to fetch loans');
    }
  }

  async getUserLoans(userId: number, status?: string) {
    try {
        let query = db.select().from(loans).where(eq(loans.userId, userId));

        if (status) {
            query = query.where(eq(loans.status, status));
        }

        const userLoans = await query;
        return userLoans;
    } catch (error) {
        console.error('Error in getUserLoans:', error);
        throw new Error('Failed to fetch user loans');
    }
  }

  async returnBook(loanId: number) {
    try {
        const loan = await db.select()
            .from(loans)
            .where(eq(loans.id, loanId))
            .limit(1);

        if (!loan.length || loan[0].status !== 'ACTIVE') {
            throw new Error('Invalid loan or already returned');
        }

        // Update loan status
        const updatedLoan = await db.update(loans)
            .set({
                returnDate: new Date(),
                status: 'RETURNED',
                updatedAt: new Date(),
            })
            .where(eq(loans.id, loanId))
            .returning();

        // Update book availability in catalog service
        const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loan[0].bookId}`);
        if (!bookResponse.ok) {
            throw new Error('Failed to fetch book data from catalog service');
        }

        const book = await bookResponse.json();

        await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${loan[0].bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                availableCopies: book.availableCopies + 1,
            }),
        });

        const channel = await getChannel()
        await channel.sendToQueue('book.returned', Buffer.from(JSON.stringify({
            userId: loan[0].userId,
            bookId: loan[0].bookId
        })))

        return updatedLoan[0];
    } catch (error) {
        console.error('Error in returnBook:', error);
        throw new Error('Failed to return book');
    }
  }

  async checkOverdueLoans() {
    try {
        const now = new Date();
        const overdueLoans = await db.select()
            .from(loans)
            .where(eq(loans.status, 'ACTIVE'))
            .where('due_date', '<', now);

        // Update status to OVERDUE
        for (const loan of overdueLoans) {
            await db.update(loans)
                .set({ status: 'OVERDUE', updatedAt: now })
                .where(eq(loans.id, loan.id));
        }

        return overdueLoans;
    } catch (error) {
        console.error('Error in checkOverdueLoans:', error);
        throw new Error('Failed to check overdue loans');
    }
  }

}