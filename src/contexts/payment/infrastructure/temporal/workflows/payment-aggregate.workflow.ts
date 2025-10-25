import {
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  log,
  proxyActivities,
} from '@temporalio/workflow';
import { PaymentStatus } from '../../../domain/value-objects/payment-status.vo';
import type * as activities from '../activities/payment-activities';

// Activity proxies
const {
  createPaymentActivity,
  updatePaymentStatusActivity,
  getPaymentActivity,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// Signal definitions (Commands)
export const createPaymentSignal =
  defineSignal<[CreatePaymentData]>('createPayment');
export const updatePaymentStatusSignal = defineSignal<
  [UpdatePaymentStatusData]
>('updatePaymentStatus');
export const processPaymentSignal =
  defineSignal<[ProcessPaymentData]>('processPayment');
export const cancelPaymentSignal =
  defineSignal<[CancelPaymentData]>('cancelPayment');
export const refundPaymentSignal =
  defineSignal<[RefundPaymentData]>('refundPayment');

// Query definitions (Read operations)
export const getPaymentQuery = defineQuery<PaymentAggregateData | null>(
  'getPayment',
);
export const getPaymentStatusQuery = defineQuery<string>('getPaymentStatus');
export const getPaymentHistoryQuery =
  defineQuery<PaymentEvent[]>('getPaymentHistory');
export const isPaymentRefundableQuery = defineQuery<boolean>(
  'isPaymentRefundable',
);
export const isPaymentCancellableQuery = defineQuery<boolean>(
  'isPaymentCancellable',
);

// Data interfaces
export interface CreatePaymentData {
  userId: string;
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
}

export interface UpdatePaymentStatusData {
  status: PaymentStatus;
  reason?: string;
}

export interface ProcessPaymentData {
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface CancelPaymentData {
  reason: string;
}

export interface RefundPaymentData {
  amount?: number; // Partial refund amount, if not provided - full refund
  reason: string;
}

export interface PaymentAggregateData {
  id: string;
  userId: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  refundedAmount?: number;
}

export interface PaymentEvent {
  type: string;
  timestamp: Date;
  data: any;
  reason?: string;
}

/**
 * Payment Aggregate Workflow - Single payment lifecycle management
 * This workflow represents a payment entity with its complete lifecycle
 */
export async function paymentAggregateWorkflow(
  paymentId: string,
): Promise<void> {
  // Aggregate state
  let payment: PaymentAggregateData | null = null;
  let state:
    | 'initial'
    | 'created'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | 'refunded'
    | 'failed' = 'initial';
  let events: PaymentEvent[] = [];
  let refundedAmount = 0;

  // Helper functions
  const addEvent = (type: string, data: any, reason?: string) => {
    events.push({
      type,
      timestamp: new Date(),
      data,
      reason,
    });
  };

  const canTransitionTo = (newStatus: PaymentStatus): boolean => {
    if (!payment) return false;

    const currentStatus = payment.status;
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [
        PaymentStatus.PROCESSING,
        PaymentStatus.CANCELLED,
      ],
      [PaymentStatus.PROCESSING]: [
        PaymentStatus.COMPLETED,
        PaymentStatus.FAILED,
        PaymentStatus.CANCELLED,
      ],
      [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [PaymentStatus.PENDING], // Retry
      [PaymentStatus.CANCELLED]: [], // Terminal state
      [PaymentStatus.REFUNDED]: [], // Terminal state
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  // Signal handlers (Commands)
  setHandler(createPaymentSignal, async (data: CreatePaymentData) => {
    if (state !== 'initial') {
      throw new Error('Payment already exists');
    }

    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    // Create payment in memory
    payment = {
      id: paymentId,
      userId: data.userId,
      customerId: data.customerId,
      amount: data.amount,
      currency: data.currency,
      status: PaymentStatus.PENDING,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Persist to database
    await createPaymentActivity({
      paymentId,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      customerId: data.customerId,
      description: data.description,
    });

    state = 'created';
    addEvent('PaymentCreated', payment);

    log.info('Payment created and persisted', {
      paymentId,
      userId: data.userId,
      amount: data.amount,
    });
  });

  setHandler(
    updatePaymentStatusSignal,
    async (data: UpdatePaymentStatusData) => {
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (!canTransitionTo(data.status)) {
        throw new Error(
          `Cannot transition from ${payment.status} to ${data.status}`,
        );
      }

      const oldStatus = payment.status;
      payment.status = data.status;
      payment.updatedAt = new Date();

      // Persist status change to database
      await updatePaymentStatusActivity({
        paymentId,
        status: data.status,
        reason: data.reason,
      });

      // Update workflow state based on payment status
      switch (data.status) {
        case PaymentStatus.PROCESSING:
          state = 'processing';
          break;
        case PaymentStatus.COMPLETED:
          state = 'completed';
          break;
        case PaymentStatus.CANCELLED:
          state = 'cancelled';
          break;
        case PaymentStatus.REFUNDED:
          state = 'refunded';
          break;
      }

      addEvent('PaymentStatusUpdated', {
        oldStatus,
        newStatus: data.status,
        reason: data.reason,
      });

      log.info('Payment status updated and persisted', {
        paymentId,
        oldStatus,
        newStatus: data.status,
        reason: data.reason,
      });
    },
  );

  setHandler(processPaymentSignal, async (data: ProcessPaymentData) => {
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Payment must be in PENDING status to process');
    }

    // Mark as processing
    payment.status = PaymentStatus.PROCESSING;
    payment.updatedAt = new Date();
    state = 'processing';

    // Persist processing status
    await updatePaymentStatusActivity({
      paymentId,
      status: PaymentStatus.PROCESSING,
      reason: 'Payment processing started',
    });

    addEvent('PaymentProcessingStarted', {
      paymentMethod: data.paymentMethod,
      metadata: data.metadata,
    });

    log.info('Payment processing started and persisted', { paymentId });

    // For demo purposes, automatically complete the payment
    // In real scenario, this would wait for external payment processor callback
    try {
      // Simulate some processing logic here
      payment.status = PaymentStatus.COMPLETED;
      payment.updatedAt = new Date();
      state = 'completed';

      // Persist completion
      await updatePaymentStatusActivity({
        paymentId,
        status: PaymentStatus.COMPLETED,
        reason: 'Payment processing completed successfully',
      });

      addEvent('PaymentProcessingCompleted', {
        paymentMethod: data.paymentMethod,
      });

      log.info('Payment processing completed and persisted', { paymentId });
    } catch (error) {
      // If processing fails, mark as failed
      payment.status = PaymentStatus.FAILED;
      payment.updatedAt = new Date();
      state = 'failed';

      await updatePaymentStatusActivity({
        paymentId,
        status: PaymentStatus.FAILED,
        reason: `Payment processing failed: ${error.message}`,
      });

      addEvent('PaymentProcessingFailed', {
        error: error.message,
      });

      log.error('Payment processing failed and persisted', {
        paymentId,
        error: error.message,
      });
    }
  });

  setHandler(cancelPaymentSignal, async (data: CancelPaymentData) => {
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (
      ![PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(
        payment.status,
      )
    ) {
      throw new Error('Payment cannot be cancelled in current status');
    }

    payment.status = PaymentStatus.CANCELLED;
    payment.updatedAt = new Date();
    state = 'cancelled';

    // Persist cancellation
    await updatePaymentStatusActivity({
      paymentId,
      status: PaymentStatus.CANCELLED,
      reason: data.reason || 'Payment cancelled',
    });

    addEvent('PaymentCancelled', {
      reason: data.reason,
    });

    log.info('Payment cancelled and persisted', {
      paymentId,
      reason: data.reason,
    });
  });

  setHandler(refundPaymentSignal, async (data: RefundPaymentData) => {
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }

    const refundAmount = data.amount || payment.amount - refundedAmount;

    if (refundAmount <= 0 || refundedAmount + refundAmount > payment.amount) {
      throw new Error('Invalid refund amount');
    }

    refundedAmount += refundAmount;

    // If fully refunded, mark as refunded
    if (refundedAmount >= payment.amount) {
      payment.status = PaymentStatus.REFUNDED;
      state = 'refunded';

      // Persist refunded status
      await updatePaymentStatusActivity({
        paymentId,
        status: PaymentStatus.REFUNDED,
        reason: data.reason || `Full refund of ${payment.amount}`,
      });
    }

    payment.refundedAmount = refundedAmount;
    payment.updatedAt = new Date();

    addEvent('PaymentRefunded', {
      refundAmount,
      totalRefunded: refundedAmount,
      reason: data.reason,
      isFullRefund: refundedAmount >= payment.amount,
    });

    log.info('Payment refunded and persisted', {
      paymentId,
      refundAmount,
      totalRefunded: refundedAmount,
      reason: data.reason,
      isFullRefund: refundedAmount >= payment.amount,
    });
  });

  // Query handlers (Read operations)
  setHandler(getPaymentQuery, (): PaymentAggregateData | null => {
    return payment;
  });

  setHandler(getPaymentStatusQuery, (): string => {
    return payment?.status || 'not_found';
  });

  setHandler(getPaymentHistoryQuery, (): PaymentEvent[] => {
    return events;
  });

  setHandler(isPaymentRefundableQuery, (): boolean => {
    return (
      payment?.status === PaymentStatus.COMPLETED &&
      refundedAmount < payment.amount
    );
  });

  setHandler(isPaymentCancellableQuery, (): boolean => {
    return payment
      ? [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(
          payment.status,
        )
      : false;
  });

  // Keep workflow alive until explicitly terminated
  // The workflow will remain active to handle signals and queries
  await condition(() => false); // This keeps the workflow running indefinitely
}
