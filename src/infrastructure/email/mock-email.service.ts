import { Injectable } from '@nestjs/common';
import { EmailService, EmailPayload } from './email.service.interface';

@Injectable()
export class MockEmailService implements EmailService {
  private sentEmails: Array<EmailPayload & { sentAt: Date }> = [];

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    // Simulate network delay
    await this.delay(100 + Math.random() * 500);

    console.log(`📧 EMAIL SENT: To ${payload.to} - ${payload.subject}`);
    this.sentEmails.push({
      ...payload,
      sentAt: new Date(),
    });

    return true;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '🎉 Welcome to our platform!',
      body: `
        Hello ${name}!
        
        Welcome to our platform! We're excited to have you on board.
        
        Your account has been successfully created and you can now start using our services.
        
        Best regards,
        The Team
      `,
      from: 'welcome@company.com',
    });
  }

  async sendPaymentConfirmation(
    email: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '✅ Payment Confirmation',
      body: `
        Your payment has been successfully processed!
        
        Amount: ${amount} ${currency}
        Transaction Date: ${new Date().toISOString()}
        
        Thank you for your business!
        
        Best regards,
        Payment Team
      `,
      from: 'payments@company.com',
    });
  }

  async sendPaymentFailure(
    email: string,
    amount: number,
    currency: string,
    reason: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '❌ Payment Failed',
      body: `
        We're sorry, but your payment could not be processed.
        
        Amount: ${amount} ${currency}
        Reason: ${reason}
        Attempted: ${new Date().toISOString()}
        
        Please try again or contact support if the problem persists.
        
        Best regards,
        Payment Team
      `,
      from: 'payments@company.com',
    });
  }

  async sendCustomerCreated(
    email: string,
    companyName: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '🏢 Customer Profile Created',
      body: `
        Your customer profile has been successfully created!
        
        Company: ${companyName}
        Created: ${new Date().toISOString()}
        
        You can now start managing your customer data and making payments.
        
        Best regards,
        Customer Success Team
      `,
      from: 'customers@company.com',
    });
  }

  // Development helper methods
  getSentEmails(): Array<EmailPayload & { sentAt: Date }> {
    return [...this.sentEmails];
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }

  getEmailCount(): number {
    return this.sentEmails.length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
