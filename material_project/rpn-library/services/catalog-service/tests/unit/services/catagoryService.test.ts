// tests/unit/services/categoryService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CategoryService } from '../../../src/services/categoryService';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [{ id: 1, ...categoryData }]
            })
          })
        }
      }));

      const result = await categoryService.createCategory(categoryData);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].name).toBe(categoryData.name);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => mockCategories
          })
        }
      }));

      const result = await categoryService.getCategories();
      expect(result).toHaveLength(2);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category'
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => [mockCategory]
              })
            })
          })
        }
      }));

      const result = await categoryService.getCategoryById(1);
      expect(result).toEqual(mockCategory);
    });

    
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData = {
        name: 'Updated Category'
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

      const result = await categoryService.updateCategory(1, updateData);
      expect(result[0].name).toBe(updateData.name);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mock.module('../../../src/config/database', () => ({
        db: {
          delete: () => ({
            where: () => ({
              returning: () => [{ id: 1 }]
            })
          })
        }
      }));

      const result = await categoryService.deleteCategory(1);
      expect(result[0]).toHaveProperty('id');
    });
  });

  describe('getBooksInCategory', () => {
    it('should return books in category', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', categoryId: 1 },
        { id: 2, title: 'Book 2', categoryId: 1 }
      ];

      mock.module('../../../src/config/database', () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => mockBooks
            })
          })
        }
      }));

      const result = await categoryService.getBooksInCategory(1);
      expect(result).toHaveLength(2);
    });
  });
});