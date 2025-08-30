// src/services/customerService.ts
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { customers } from '../db/schema';
import type { Customer } from '../types';

export class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    idNumber?: string;
    idType?: string;
  }): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(data)
      .returning();
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));
    return customer;
  }

  async createOrUpdateCustomer(data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Customer> {
    try {
      // Check if customer exists
      const [existingCustomer] = await db
        .select()
        .from(customers)
        .where(eq(customers.email, data.email));

      if (existingCustomer) {
        // Update existing customer
        const [updatedCustomer] = await db
          .update(customers)
          .set({
            name: data.name,
            phone: data.phone,
            updatedAt: new Date()
          })
          .where(eq(customers.id, existingCustomer.id))
          .returning();

        return updatedCustomer;
      }

      // Create new customer
      const [newCustomer] = await db
        .insert(customers)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone
        })
        .returning();

      return newCustomer;
    } catch (error: any) {
      console.error('Error creating/updating customer:', error);
      throw new Error(`Failed to manage customer record: ${error.message}`);
    }
  }
}