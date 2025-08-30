import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import type { User } from '../db/schema';
import { hash, compare } from 'bcrypt'
import { sanitizeUser } from '../middleware/sanitize';


export class UserService {
  async createUser(userData: any) {
    try {
      const hashedPassword = await hash(userData.password, 10);
      const user = await db.insert(users).values({
          ...userData,
          password: hashedPassword,
      }).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new Error('Failed to create user');
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user.length) {
          throw new Error('User not found');
      }

      const isValid = await compare(password, user[0].password);

      if (!isValid) {
          throw new Error('Invalid password');
      }

      return user[0];
    } catch (error) {
      console.error('Error in loginUser:', error);
      throw new Error('Failed to login user');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return sanitizeUser(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any) {
    try {
      if (userData.password) {
          userData.password = await hash(userData.password, 10);
      }

      const updatedUser = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser.length) {
        console.warn(`User not found with ID: ${id}`);
        throw new Error('User not found');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw new Error('Failed to update user');
    }
  }

}