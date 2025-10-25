import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentAggregateService } from '../application/services/payment-aggregate.service';
import { PaymentStatus } from '../domain/value-objects/payment-status.vo';
import { randomUUID } from 'crypto';

// DTOs
export interface CreateTemporalPaymentDto {
  userId: string;
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
}

export interface UpdateTemporalPaymentStatusDto {
  status: PaymentStatus;
  reason?: string;
}

export interface ProcessTemporalPaymentDto {
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface CancelTemporalPaymentDto {
  reason: string;
}

export interface RefundTemporalPaymentDto {
  amount?: number;
  reason: string;
}

@Controller('temporal-payments')
export class TemporalPaymentController {
  constructor(
    private readonly paymentAggregateService: PaymentAggregateService,
  ) {}

  /**
   * Create a new payment using Temporal-native CQRS
   */
  @Post()
  async createPayment(@Body() request: CreateTemporalPaymentDto) {
    const paymentId = randomUUID();

    await this.paymentAggregateService.createPayment(paymentId, {
      userId: request.userId,
      amount: request.amount,
      currency: request.currency || 'USD',
      customerId: request.customerId,
      description: request.description,
    });

    return {
      paymentId,
      workflowId: `payment-aggregate-${paymentId}`,
      status: 'created',
      message: 'Payment aggregate workflow started',
    };
  }

  /**
   * Get payment data from workflow state
   */
  @Get(':id')
  async getPayment(@Param('id') paymentId: string) {
    const payment = await this.paymentAggregateService.getPayment(paymentId);

    if (!payment) {
      return {
        error: 'Payment not found',
        paymentId,
      };
    }

    return {
      payment,
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Get payment status
   */
  @Get(':id/status')
  async getPaymentStatus(@Param('id') paymentId: string) {
    const status =
      await this.paymentAggregateService.getPaymentStatus(paymentId);

    return {
      paymentId,
      status,
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Get payment history/events
   */
  @Get(':id/history')
  async getPaymentHistory(@Param('id') paymentId: string) {
    const events =
      await this.paymentAggregateService.getPaymentHistory(paymentId);

    return {
      paymentId,
      events,
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Update payment status
   */
  @Patch(':id/status')
  async updatePaymentStatus(
    @Param('id') paymentId: string,
    @Body() request: UpdateTemporalPaymentStatusDto,
  ) {
    await this.paymentAggregateService.updatePaymentStatus(paymentId, {
      status: request.status,
      reason: request.reason,
    });

    return {
      paymentId,
      status: 'status_update_sent',
      message: `Payment status update signal sent to workflow`,
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Process payment
   */
  @Post(':id/process')
  async processPayment(
    @Param('id') paymentId: string,
    @Body() request: ProcessTemporalPaymentDto = {},
  ) {
    await this.paymentAggregateService.processPayment(paymentId, {
      paymentMethod: request.paymentMethod,
      metadata: request.metadata,
    });

    return {
      paymentId,
      status: 'processing_started',
      message: 'Payment processing signal sent to workflow',
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Cancel payment
   */
  @Post(':id/cancel')
  async cancelPayment(
    @Param('id') paymentId: string,
    @Body() request: CancelTemporalPaymentDto,
  ) {
    await this.paymentAggregateService.cancelPayment(paymentId, {
      reason: request.reason,
    });

    return {
      paymentId,
      status: 'cancellation_sent',
      message: 'Payment cancellation signal sent to workflow',
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Refund payment
   */
  @Post(':id/refund')
  async refundPayment(
    @Param('id') paymentId: string,
    @Body() request: RefundTemporalPaymentDto,
  ) {
    await this.paymentAggregateService.refundPayment(paymentId, {
      amount: request.amount,
      reason: request.reason,
    });

    return {
      paymentId,
      status: 'refund_sent',
      message: 'Payment refund signal sent to workflow',
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Check if payment is refundable
   */
  @Get(':id/refundable')
  async isPaymentRefundable(@Param('id') paymentId: string) {
    const isRefundable =
      await this.paymentAggregateService.isPaymentRefundable(paymentId);

    return {
      paymentId,
      isRefundable,
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Check if payment is cancellable
   */
  @Get(':id/cancellable')
  async isPaymentCancellable(@Param('id') paymentId: string) {
    const isCancellable =
      await this.paymentAggregateService.isPaymentCancellable(paymentId);

    return {
      paymentId,
      isCancellable,
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }

  /**
   * Terminate payment workflow (for testing/cleanup)
   */
  @Delete(':id/workflow')
  async terminateWorkflow(
    @Param('id') paymentId: string,
    @Query('reason') reason?: string,
  ) {
    await this.paymentAggregateService.terminatePaymentWorkflow(
      paymentId,
      reason || 'Manual termination via API',
    );

    return {
      paymentId,
      status: 'workflow_terminated',
      message: 'Payment workflow terminated',
      workflowId: `payment-aggregate-${paymentId}`,
    };
  }
}
