// tests/unit/services/notificationService.test.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NotificationService } from '../../../src/services/notificationService';
import { emailTemplates } from '../../../src/templates/emailTemplates';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    process.env.USER_SERVICE_URL = 'http://localhost:3001';
    process.env.CATALOG_SERVICE_URL = 'http://localhost:3002';

    // Mock email service
    mock.module('../../../src/services/emailServices', () => ({
      sendEmail: async () => ({ messageId: 'test-id' })
    }));
  });

  describe('createNotification', () => {
    it('should create notification and send email successfully', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'TEST',
        message: 'Test message',
        status: 'PENDING'
      };

      // Mock database operations
      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [mockNotification]
            })
          }),
          update: () => ({
            set: () => ({
              where: () => Promise.resolve([{ ...mockNotification, status: 'SENT' }])
            })
          })
        }
      }));

      // Mock fetch for user service
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({ email: 'test@example.com' })
      } as Response));

      const result = await notificationService.createNotification({
        userId: 1,
        type: 'TEST',
        message: 'Test message'
      });

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('handleLoanDueNotification', () => {
    it('should create loan due notification', async () => {
      // Mock book service response
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Book' })
      } as Response));

      // Mock createNotification
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'LOAN_DUE',
        message: emailTemplates.loanDue('Test Book', '2024-01-01')
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [mockNotification]
            })
          }),
          update: () => ({
            set: () => ({
              where: () => Promise.resolve([{ ...mockNotification, status: 'SENT' }])
            })
          })
        }
      }));

      const result = await notificationService.handleLoanDueNotification(1, 1, '2024-01-01');
      expect(result.type).toBe('LOAN_DUE');
    });
  });

  describe('handleBookReturnedNotification', () => {
    it('should create book returned notification', async () => {
      // Mock book service response
      global.fetch = mock(async () => ({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Book' })
      } as Response));

      // Mock createNotification
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'BOOK_RETURNED',
        message: emailTemplates.bookReturned('Test Book')
      };

      mock.module('../../../src/config/database', () => ({
        db: {
          insert: () => ({
            values: () => ({
              returning: () => [mockNotification]
            })
          }),
          update: () => ({
            set: () => ({
              where: () => Promise.resolve([{ ...mockNotification, status: 'SENT' }])
            })
          })
        }
      }));

      const result = await notificationService.handleBookReturnedNotification(1, 1);
      expect(result.type).toBe('BOOK_RETURNED');
    });
  });

  describe('sendTestNotification', () => {
    it('should send test email successfully', async () => {
      const result = await notificationService.sendTestNotification({
        email: 'test@example.com',
        type: 'TEST_EMAIL'
      });

      expect(result.success).toBe(true);
    });

    it('should throw error for invalid notification type', async () => {
      await expect(
        notificationService.sendTestNotification({
          email: 'test@example.com',
          type: 'INVALID_TYPE'
        })
      ).rejects.toThrow('Invalid notification type');
    });
  });
});