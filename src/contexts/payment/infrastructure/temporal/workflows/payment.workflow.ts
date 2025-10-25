import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/payment-activities';

const { validatePaymentData, processPayment, sendPaymentEmail } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '2 minutes',
  });

export interface SendPaymentInput {
  userId: string;
  customerId?: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface SendPaymentResult {
  paymentId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function sendPaymentWorkflow(
  input: SendPaymentInput,
): Promise<SendPaymentResult> {
  try {
    // Step 1: Validate payment data
    await validatePaymentData(input);

    // Step 2: Process payment
    const paymentId = await processPayment({
      userId: input.userId,
      customerId: input.customerId,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
    });

    // Step 3: Send payment confirmation email
    await sendPaymentEmail({
      userId: input.userId,
      paymentId,
      amount: input.amount,
      currency: input.currency,
    });

    return {
      paymentId,
      status: 'completed',
    };
  } catch (error) {
    return {
      paymentId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
