import { Context } from '@temporalio/activity';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { Payment } from '../../../domain/entities/payment.entity';

export interface ValidatePaymentDataInput {
  userId: string;
  customerId?: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface ProcessPaymentInput {
  userId: string;
  customerId?: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface SendPaymentEmailInput {
  userId: string;
  paymentId: string;
  amount: number;
  currency: string;
}

// Helper function to create Prisma service
function createPrismaService() {
  return new PrismaService();
}

export async function validatePaymentData(
  input: ValidatePaymentDataInput,
): Promise<void> {
  Context.current().log.info('Validating payment data', { input });

  if (!input.userId) {
    throw new Error('User ID is required');
  }

  if (!input.amount || input.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (!input.currency) {
    throw new Error('Currency is required');
  }

  Context.current().log.info('Payment data validation completed');
}

export async function processPayment(
  input: ProcessPaymentInput,
): Promise<string> {
  Context.current().log.info('Processing payment', { input });

  const prisma = createPrismaService();

  try {
    // Validate that user exists
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    // Validate that customer exists if provided
    if (input.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: input.customerId },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${input.customerId} not found`);
      }
    }

    // Create payment using domain entity
    const payment = Payment.create(
      input.userId,
      input.amount,
      input.currency || 'USD',
      input.customerId,
      input.description,
    );

    // Save to database
    await prisma.payment.create({
      data: {
        id: payment.getId().getValue(),
        userId: payment.getUserId().getValue(),
        customerId: payment.getCustomerId()?.getValue(),
        amount: payment.getAmount().getValue(),
        currency: payment.getCurrency().getValue(),
        status: payment.getStatus().getValue(),
        description: payment.getDescription(),
        createdAt: payment.getCreatedAt(),
        updatedAt: payment.getUpdatedAt(),
      },
    });

    const paymentId = payment.getId().getValue();
    Context.current().log.info('Payment processed', { paymentId });
    return paymentId;
  } catch (error) {
    Context.current().log.error('Failed to process payment', {
      error: error.message,
    });
    throw error;
  }
}

export async function sendPaymentEmail(
  input: SendPaymentEmailInput,
): Promise<void> {
  Context.current().log.info('Sending payment confirmation email', { input });

  // For demo purposes, just log the email
  console.log(`📧 PAYMENT CONFIRMATION EMAIL:`);
  console.log(`   User ID: ${input.userId}`);
  console.log(`   Payment ID: ${input.paymentId}`);
  console.log(`   Amount: ${input.amount} ${input.currency}`);
  console.log(
    `   Subject: Payment Confirmation - ${input.amount} ${input.currency}`,
  );

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  Context.current().log.info('Payment confirmation email sent');
}
