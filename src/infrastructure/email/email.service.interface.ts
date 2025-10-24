export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface EmailService {
  sendEmail(payload: EmailPayload): Promise<boolean>;
  sendWelcomeEmail(email: string, name: string): Promise<boolean>;
  sendPaymentConfirmation(
    email: string,
    amount: number,
    currency: string,
  ): Promise<boolean>;
  sendPaymentFailure(
    email: string,
    amount: number,
    currency: string,
    reason: string,
  ): Promise<boolean>;
  sendCustomerCreated(email: string, companyName: string): Promise<boolean>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
