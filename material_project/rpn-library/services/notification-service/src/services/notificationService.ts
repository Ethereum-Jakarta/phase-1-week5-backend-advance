// src/services/notificationService.ts
import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { notifications } from '../models/schema'
import { sendEmail } from './emailServices'
import { emailTemplates } from '../templates/emailTemplates'

export class NotificationService {
  async createNotification(data: any) {
    const notification = await db.insert(notifications)
      .values(data)
      .returning()

    // Get user email from user service
    const userResponse = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${data.userId}`)
    const user = await userResponse.json()

    // Send email
    try {
      await sendEmail(
        user.email,
        `Library Notification - ${data.type}`,
        data.message
      )

      await db.update(notifications)
        .set({ status: 'SENT' })
        .where(eq(notifications.id, notification[0].id))
    } catch (error) {
      await db.update(notifications)
        .set({ status: 'FAILED' })
        .where(eq(notifications.id, notification[0].id))
      throw error
    }

    return notification[0]
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit

    const [data, total] = await Promise.all([
      db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(notifications.createdAt),
      db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .then(res => Number(res[0].count))
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async handleLoanDueNotification(userId: number, bookId: number, dueDate: string) {
    const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${bookId}`)
    const book = await bookResponse.json()
  
    const message = emailTemplates.loanDue(book.title, dueDate)
  
    return await this.createNotification({
      userId,
      type: 'LOAN_DUE',
      message
    })
  }
  
  async handleBookReturnedNotification(userId: number, bookId: number) {
    const bookResponse = await fetch(`${process.env.CATALOG_SERVICE_URL}/api/books/${bookId}`)
    const book = await bookResponse.json()
  
    const message = emailTemplates.bookReturned(book.title)
  
    return await this.createNotification({
      userId,
      type: 'BOOK_RETURNED',
      message
    })
  }

  async sendTestNotification(data: { email: string, type: string }) {
    let subject: string
    let message: string

    switch (data.type) {
      case 'TEST_EMAIL':
        subject = 'Test Notification'
        message = emailTemplates.test()
        break
      case 'LOAN_DUE':
        subject = 'Book Due Reminder - Test'
        message = emailTemplates.loanDue('Test Book', new Date().toISOString())
        break
      case 'BOOK_RETURNED':
        subject = 'Book Returned - Test'
        message = emailTemplates.bookReturned('Test Book')
        break
      default:
        throw new Error('Invalid notification type')
    }

    try {
      const result = await sendEmail(data.email, subject, message)
      return {
        success: true,
        message: 'Test notification sent successfully',
        details: result
      }
    } catch (error: any) {
      console.error('Failed to send test notification:', error)
      throw new Error(`Failed to send test notification: ${error.message}`)
    }
  }
}