import { jest } from '@jest/globals';

// Mock email providers
jest.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: jest.fn(),
    send: jest.fn()
  }
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

describe('Email Service Tests', () => {
  let emailService: any;
  let mockSendGrid: any;
  let mockResend: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import after mocking
    const { EmailService } = await import('../../../services/email');
    emailService = new EmailService();
    
    // Get mocked instances
    const sgMail = await import('@sendgrid/mail');
    mockSendGrid = sgMail.default;
    
    mockResend = emailService.resend;
  });

  describe('Email Sending', () => {
    it('should send welcome email', async () => {
      const recipient = {
        email: 'newuser@example.com',
        name: 'New User'
      };

      mockResend.emails.send.mockResolvedValue({
        id: 'email_123',
        from: 'noreply@mundotango.com',
        to: recipient.email
      });

      const result = await emailService.sendWelcomeEmail(recipient);

      expect(result.id).toBe('email_123');
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: recipient.email,
        subject: expect.stringContaining('Welcome'),
        html: expect.stringContaining(recipient.name)
      });
    });

    it('should send password reset email', async () => {
      const user = {
        email: 'user@example.com',
        name: 'Test User'
      };
      const resetToken = 'reset_token_123';

      mockResend.emails.send.mockResolvedValue({
        id: 'email_reset_123'
      });

      await emailService.sendPasswordResetEmail(user, resetToken);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: user.email,
        subject: expect.stringContaining('Password Reset'),
        html: expect.stringContaining(resetToken)
      });
    });

    it('should send event reminder email', async () => {
      const user = { email: 'user@example.com', name: 'User' };
      const event = {
        title: 'Milonga Night',
        startDate: new Date('2025-09-01T20:00:00Z'),
        location: 'Salon Canning'
      };

      mockResend.emails.send.mockResolvedValue({ id: 'email_reminder' });

      await emailService.sendEventReminder(user, event);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: user.email,
        subject: expect.stringContaining('Reminder'),
        html: expect.stringContaining(event.title)
      });
    });
  });

  describe('Email Templates', () => {
    it('should use correct template for each email type', async () => {
      const templates = [
        { type: 'welcome', method: 'sendWelcomeEmail' },
        { type: 'passwordReset', method: 'sendPasswordResetEmail' },
        { type: 'eventInvite', method: 'sendEventInvite' },
        { type: 'newsletter', method: 'sendNewsletter' }
      ];

      for (const template of templates) {
        mockResend.emails.send.mockResolvedValue({ id: `email_${template.type}` });
        
        await emailService[template.method]({ email: 'test@example.com' });
        
        expect(mockResend.emails.send).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.any(String)
          })
        );
      }
    });

    it('should personalize email content', async () => {
      const user = {
        email: 'user@example.com',
        name: 'John Doe',
        preferences: {
          language: 'es'
        }
      };

      mockResend.emails.send.mockResolvedValue({ id: 'email_123' });

      await emailService.sendWelcomeEmail(user);

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Bienvenido')
        })
      );
    });
  });

  describe('Bulk Email Sending', () => {
    it('should send bulk emails in batches', async () => {
      const recipients = Array.from({ length: 150 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`
      }));

      mockResend.emails.send.mockResolvedValue({ id: 'bulk_email' });

      await emailService.sendBulkEmail(recipients, {
        subject: 'Newsletter',
        content: 'Newsletter content'
      });

      // Should batch in groups of 100
      expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
    });

    it('should handle failed recipients in bulk send', async () => {
      const recipients = [
        { email: 'valid@example.com' },
        { email: 'invalid@' },
        { email: 'another@example.com' }
      ];

      mockResend.emails.send
        .mockResolvedValueOnce({ id: 'email_1' })
        .mockRejectedValueOnce(new Error('Invalid email'))
        .mockResolvedValueOnce({ id: 'email_3' });

      const results = await emailService.sendBulkEmail(recipients, {
        subject: 'Test',
        content: 'Test'
      });

      expect(results.sent).toBe(2);
      expect(results.failed).toBe(1);
      expect(results.errors).toHaveLength(1);
    });
  });

  describe('Email Tracking', () => {
    it('should track email opens', async () => {
      const emailId = 'email_123';
      const trackingPixel = emailService.generateTrackingPixel(emailId);

      expect(trackingPixel).toContain('img');
      expect(trackingPixel).toContain(emailId);
    });

    it('should track link clicks', async () => {
      const emailId = 'email_123';
      const originalUrl = 'https://mundotango.com/event/123';
      
      const trackedUrl = emailService.trackLink(originalUrl, emailId);

      expect(trackedUrl).toContain('track/click');
      expect(trackedUrl).toContain(emailId);
      expect(trackedUrl).toContain(encodeURIComponent(originalUrl));
    });

    it('should record email metrics', async () => {
      const metrics = {
        emailId: 'email_123',
        type: 'open',
        timestamp: new Date()
      };

      await emailService.recordMetric(metrics);

      const stats = await emailService.getEmailStats('email_123');
      expect(stats.opens).toBe(1);
    });
  });

  describe('Email Validation', () => {
    it('should validate email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user+tag@example.co.uk',
        'name@subdomain.example.com'
      ];

      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user..double@example.com'
      ];

      for (const email of validEmails) {
        expect(emailService.isValidEmail(email)).toBe(true);
      }

      for (const email of invalidEmails) {
        expect(emailService.isValidEmail(email)).toBe(false);
      }
    });

    it('should check for disposable email domains', async () => {
      const disposableEmails = [
        'user@tempmail.com',
        'test@guerrillamail.com'
      ];

      const validEmails = [
        'user@gmail.com',
        'test@company.com'
      ];

      for (const email of disposableEmails) {
        const isDisposable = await emailService.isDisposableEmail(email);
        expect(isDisposable).toBe(true);
      }

      for (const email of validEmails) {
        const isDisposable = await emailService.isDisposableEmail(email);
        expect(isDisposable).toBe(false);
      }
    });
  });

  describe('Email Queuing', () => {
    it('should queue emails for delayed sending', async () => {
      const email = {
        to: 'user@example.com',
        subject: 'Scheduled Email',
        content: 'This is scheduled'
      };
      const sendAt = new Date(Date.now() + 3600000); // 1 hour later

      const jobId = await emailService.queueEmail(email, sendAt);

      expect(jobId).toBeDefined();
      
      const job = await emailService.getQueuedJob(jobId);
      expect(job.sendAt).toEqual(sendAt);
    });

    it('should process email queue', async () => {
      // Queue some emails
      await emailService.queueEmail({
        to: 'user1@example.com',
        subject: 'Test 1'
      }, new Date(Date.now() - 1000)); // Past time

      await emailService.queueEmail({
        to: 'user2@example.com',
        subject: 'Test 2'
      }, new Date(Date.now() + 3600000)); // Future time

      mockResend.emails.send.mockResolvedValue({ id: 'sent_email' });

      await emailService.processQueue();

      // Should only send the past-due email
      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user1@example.com'
        })
      );
    });
  });

  describe('Email Attachments', () => {
    it('should attach files to emails', async () => {
      const attachment = {
        filename: 'invoice.pdf',
        content: Buffer.from('PDF content'),
        contentType: 'application/pdf'
      };

      mockResend.emails.send.mockResolvedValue({ id: 'email_with_attachment' });

      await emailService.sendEmailWithAttachment({
        to: 'user@example.com',
        subject: 'Invoice',
        content: 'Please find attached',
        attachments: [attachment]
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'invoice.pdf'
            })
          ])
        })
      );
    });

    it('should validate attachment size', async () => {
      const largeAttachment = {
        filename: 'large.zip',
        content: Buffer.alloc(26 * 1024 * 1024), // 26MB
        contentType: 'application/zip'
      };

      await expect(emailService.sendEmailWithAttachment({
        to: 'user@example.com',
        subject: 'Large file',
        attachments: [largeAttachment]
      })).rejects.toThrow('Attachment too large');
    });
  });

  describe('Email Provider Failover', () => {
    it('should failover to SendGrid if Resend fails', async () => {
      mockResend.emails.send.mockRejectedValue(new Error('Resend API error'));
      mockSendGrid.send.mockResolvedValue([{ statusCode: 202 }]);

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        content: 'Test content'
      });

      expect(mockResend.emails.send).toHaveBeenCalled();
      expect(mockSendGrid.send).toHaveBeenCalled();
    });

    it('should retry on temporary failures', async () => {
      mockResend.emails.send
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ id: 'email_retry_success' });

      const result = await emailService.sendEmailWithRetry({
        to: 'user@example.com',
        subject: 'Test Retry'
      });

      expect(result.id).toBe('email_retry_success');
      expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('Unsubscribe Management', () => {
    it('should handle unsubscribe requests', async () => {
      const email = 'user@example.com';
      const token = 'unsubscribe_token_123';

      await emailService.processUnsubscribe(email, token);

      const isUnsubscribed = await emailService.isUnsubscribed(email);
      expect(isUnsubscribed).toBe(true);
    });

    it('should respect unsubscribe preferences', async () => {
      await emailService.addToUnsubscribeList('unsubscribed@example.com');

      await expect(emailService.sendMarketingEmail({
        to: 'unsubscribed@example.com',
        subject: 'Marketing'
      })).rejects.toThrow('User unsubscribed');
    });

    it('should include unsubscribe link in marketing emails', async () => {
      mockResend.emails.send.mockResolvedValue({ id: 'marketing_email' });

      await emailService.sendMarketingEmail({
        to: 'user@example.com',
        subject: 'Newsletter',
        content: 'Newsletter content'
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('unsubscribe')
        })
      );
    });
  });
});