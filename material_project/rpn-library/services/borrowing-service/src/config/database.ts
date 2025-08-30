// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString, { 
  max: 1,
  ssl: true
})

export const db = drizzle(client)

// Types for loan status
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE'

// Interface for loan creation
export interface CreateLoanDTO {
  userId: number
  bookId: number
}

// Interface for loan response
export interface LoanResponse {
  id: number
  userId: number
  bookId: number
  borrowDate: Date
  dueDate: Date
  returnDate?: Date
  status: LoanStatus
  createdAt: Date
  updatedAt: Date
}