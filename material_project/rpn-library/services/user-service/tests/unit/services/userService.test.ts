// tests/unit/services/userService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { UserService } from '../../../src/services/userServices';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();

    // Mock bcrypt globally
    mock.module('bcrypt', () => ({
      hash: async (data: string) => 'hashed_' + data,
      compare: async (data: string, hash: string) => hash === 'hashed_' + data
    }));
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{
                id: 1,
                username: userData.username,
                email: userData.email,
                password: 'hashed_' + userData.password,
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            })
          })
        }
      }));

      const result = await userService.createUser(userData);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].username).toBe(userData.username);
      expect(result[0].email).toBe(userData.email);
      expect(result[0].password).toStartWith('hashed_');
    });

    it('should throw error if user creation fails', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => {
            throw new Error('Database error');
          }
        }
      }));

      await expect(userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('Failed to create user');
    });

    it('should throw error if email already exists', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => {
            throw new Error('duplicate key value violates unique constraint');
          }
        }
      }));

      await expect(userService.createUser({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      })).rejects.toThrow('Failed to create user');
    });
  });

  describe('loginUser', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [{
                  id: 1,
                  email: loginData.email,
                  password: 'hashed_' + loginData.password,
                  username: 'testuser'
                }]
              })
            })
          })
        }
      }));

      const result = await userService.loginUser(loginData.email, loginData.password);
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(loginData.email);
    });

    it('should throw error if password is incorrect', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [{
                  id: 1,
                  email: 'test@example.com',
                  password: 'hashed_correctpassword',
                  username: 'testuser'
                }]
              })
            })
          })
        }
      }));

      await expect(userService.loginUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Failed to login user');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockUser]
              })
            })
          })
        }
      }));

      const result = await userService.getUserById(1);
      // @ts-ignore
      expect(result).toEqual(mockUser);
    });

    
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{
                  id: 1,
                  ...updateData,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }]
              })
            })
          })
        }
      }));

      const result = await userService.updateUser(1, updateData);
      expect(result[0].username).toBe(updateData.username);
      expect(result[0].email).toBe(updateData.email);
    });

    it('should update password if provided', async () => {
      const updateData = {
        password: 'newpassword123'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => [{
                  id: 1,
                  password: 'hashed_' + updateData.password,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }]
              })
            })
          })
        }
      }));

      const result = await userService.updateUser(1, updateData);
      expect(result[0].password).toStartWith('hashed_');
    });

    it('should throw error if update fails', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          update: () => {
            throw new Error('Update failed');
          }
        }
      }));

      await expect(userService.updateUser(1, { username: 'newname' }))
        .rejects.toThrow('Failed to update user');
    });
  });
});