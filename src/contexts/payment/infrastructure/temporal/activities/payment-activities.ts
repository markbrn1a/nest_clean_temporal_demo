import { Context } from '@temporalio/activity';
import { type PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentStatus } from '../../../domain/value-objects/payment-status.vo';

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

// Global variable to hold injected PrismaService
let prismaService: PrismaService;

// Function to inject dependencies (called during worker setup)
export function injectDependencies(prisma: PrismaService) {
  prismaService = prisma;
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

  try {
    // Validate that user exists
    const user = await prismaService.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    // Validate that customer exists if provided
    if (input.customerId) {
      const customer = await prismaService.customer.findUnique({
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
    await prismaService.payment.create({
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

// New activities for Payment Aggregate Workflow

export interface CreatePaymentActivityInput {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
}

export interface UpdatePaymentStatusActivityInput {
  paymentId: string;
  status: PaymentStatus;
  reason?: string;
}

export interface GetPaymentActivityInput {
  paymentId: string;
}

export async function createPaymentActivity(
  input: CreatePaymentActivityInput,
): Promise<void> {
  Context.current().log.info('Creating payment in database', { input });

  try {
    // Create payment using domain entity
    const payment = Payment.create(
      input.userId,
      input.amount,
      input.currency,
      input.customerId,
      input.description,
    );

    // Override the generated ID with the one from workflow
    const paymentData = {
      id: input.paymentId,
      userId: payment.getUserId().getValue(),
      customerId: payment.getCustomerId()?.getValue(),
      amount: payment.getAmount().getValue(),
      currency: payment.getCurrency().getValue(),
      status: payment.getStatus().getValue(),
      description: payment.getDescription(),
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };

    await prismaService.payment.create({
      data: paymentData,
    });

    Context.current().log.info('Payment created in database', {
      paymentId: input.paymentId,
    });
  } catch (error) {
    Context.current().log.error('Failed to create payment in database', {
      error: error.message,
      paymentId: input.paymentId,
    });
    throw error;
  }
}

export async function updatePaymentStatusActivity(
  input: UpdatePaymentStatusActivityInput,
): Promise<void> {
  Context.current().log.info('Updating payment status in database', { input });

  try {
    await prismaService.payment.update({
      where: { id: input.paymentId },
      data: {
        status: input.status,
        updatedAt: new Date(),
      },
    });

    Context.current().log.info('Payment status updated in database', {
      paymentId: input.paymentId,
      status: input.status,
    });
  } catch (error) {
    Context.current().log.error('Failed to update payment status in database', {
      error: error.message,
      paymentId: input.paymentId,
      status: input.status,
    });
    throw error;
  }
}

export async function getPaymentActivity(
  input: GetPaymentActivityInput,
): Promise<any | null> {
  Context.current().log.info('Fetching payment from database', { input });

  try {
    const payment = await prismaService.payment.findUnique({
      where: { id: input.paymentId },
    });

    Context.current().log.info('Payment fetched from database', {
      paymentId: input.paymentId,
      found: !!payment,
    });

    return payment;
  } catch (error) {
    Context.current().log.error('Failed to fetch payment from database', {
      error: error.message,
      paymentId: input.paymentId,
    });
    throw error;
  }
}
