// tests/unit/services/emailService.test.ts
import { describe, expect, it, mock } from "bun:test";
import { sendEmail } from '../../../src/services/emailServices';

describe('EmailService', () => {
  it('should send email successfully', async () => {
    mock.module('nodemailer', () => ({
      createTransport: () => ({
        sendMail: async () => ({ messageId: 'test-id' })
      })
    }));

    const result = await sendEmail(
      'test@example.com',
      'Test Subject',
      '<p>Test content</p>'
    );

    expect(result).toHaveProperty('messageId');
  });
});