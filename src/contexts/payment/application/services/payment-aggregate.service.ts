import { Injectable } from '@nestjs/common';
import { TemporalService } from '../../../../infrastructure/temporal/temporal.service';
import {
  createPaymentSignal,
  updatePaymentStatusSignal,
  processPaymentSignal,
  cancelPaymentSignal,
  refundPaymentSignal,
  getPaymentQuery,
  getPaymentStatusQuery,
  getPaymentHistoryQuery,
  isPaymentRefundableQuery,
  isPaymentCancellableQuery,
  CreatePaymentData,
  UpdatePaymentStatusData,
  ProcessPaymentData,
  CancelPaymentData,
  RefundPaymentData,
  PaymentAggregateData,
  PaymentEvent,
} from '../../infrastructure/temporal/workflows/payment-aggregate.workflow';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo';

@Injectable()
export class PaymentAggregateService {
  constructor(private readonly temporalService: TemporalService) {}

  /**
   * Create a new payment aggregate workflow
   */
  async createPayment(
    paymentId: string,
    data: CreatePaymentData,
  ): Promise<void> {
    // Start the workflow with signalWithStart
    await this.temporalService.signalWithStart('paymentAggregateWorkflow', {
      taskQueue: 'main-task-queue',
      workflowId: `payment-aggregate-${paymentId}`,
      signal: createPaymentSignal.name,
      signalArgs: [data],
      args: [paymentId],
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    data: UpdatePaymentStatusData,
  ): Promise<void> {
    await this.temporalService.signalWorkflow(
      `payment-aggregate-${paymentId}`,
      updatePaymentStatusSignal.name,
      data,
    );
  }

  /**
   * Process a payment
   */
  async processPayment(
    paymentId: string,
    data: ProcessPaymentData,
  ): Promise<void> {
    await this.temporalService.signalWorkflow(
      `payment-aggregate-${paymentId}`,
      processPaymentSignal.name,
      data,
    );
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(
    paymentId: string,
    data: CancelPaymentData,
  ): Promise<void> {
    await this.temporalService.signalWorkflow(
      `payment-aggregate-${paymentId}`,
      cancelPaymentSignal.name,
      data,
    );
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    paymentId: string,
    data: RefundPaymentData,
  ): Promise<void> {
    await this.temporalService.signalWorkflow(
      `payment-aggregate-${paymentId}`,
      refundPaymentSignal.name,
      data,
    );
  }

  /**
   * Get payment data (Query)
   */
  async getPayment(paymentId: string): Promise<PaymentAggregateData | null> {
    try {
      const result = await this.temporalService.queryWorkflow(
        `payment-aggregate-${paymentId}`,
        getPaymentQuery.name,
      );
      return result as PaymentAggregateData | null;
    } catch (error) {
      if (error.message?.includes('workflow not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get payment status (Query)
   */
  async getPaymentStatus(paymentId: string): Promise<string | null> {
    try {
      const result = await this.temporalService.queryWorkflow(
        `payment-aggregate-${paymentId}`,
        getPaymentStatusQuery.name,
      );
      return result as string | null;
    } catch (error) {
      if (error.message?.includes('workflow not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get payment history (Query)
   */
  async getPaymentHistory(paymentId: string): Promise<PaymentEvent[]> {
    try {
      const result = await this.temporalService.queryWorkflow(
        `payment-aggregate-${paymentId}`,
        getPaymentHistoryQuery.name,
      );
      return (result as PaymentEvent[]) || [];
    } catch (error) {
      if (error.message?.includes('workflow not found')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Check if payment is refundable (Query)
   */
  async isPaymentRefundable(paymentId: string): Promise<boolean> {
    try {
      const result = await this.temporalService.queryWorkflow(
        `payment-aggregate-${paymentId}`,
        isPaymentRefundableQuery.name,
      );
      return result as boolean;
    } catch (error) {
      if (error.message?.includes('workflow not found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if payment is cancellable (Query)
   */
  async isPaymentCancellable(paymentId: string): Promise<boolean> {
    try {
      const result = await this.temporalService.queryWorkflow(
        `payment-aggregate-${paymentId}`,
        isPaymentCancellableQuery.name,
      );
      return result as boolean;
    } catch (error) {
      if (error.message?.includes('workflow not found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Terminate a payment workflow
   */
  async terminatePaymentWorkflow(
    paymentId: string,
    reason: string = 'Manual termination',
  ): Promise<void> {
    await this.temporalService.terminateWorkflow(
      `payment-aggregate-${paymentId}`,
      reason,
    );
  }

  /**
   * Get workflow execution info
   */
  async getWorkflowInfo(paymentId: string) {
    try {
      const handle = await this.temporalService.getWorkflowHandle(
        `payment-aggregate-${paymentId}`,
      );
      return await handle.describe();
    } catch (error) {
      if (error.message?.includes('workflow not found')) {
        return null;
      }
      throw error;
    }
  }
}
