import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePaymentCommand } from '../update-payment.command';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentStatus } from '../../../domain/value-objects/payment-status.vo';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../../ports/payment.repository.port';

@CommandHandler(UpdatePaymentCommand)
export class UpdatePaymentHandler
  implements ICommandHandler<UpdatePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(command: UpdatePaymentCommand): Promise<Payment> {
    const { id, status, description } = command;

    // Find existing payment
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new Error('Payment not found.');
    }

    // Update status if provided
    if (status) {
      const paymentStatus = this.parsePaymentStatus(status);
      existingPayment.updateStatus(paymentStatus);
    }

    // Update description if provided
    if (description !== undefined) {
      existingPayment.updateDescription(description);
    }

    return await this.paymentRepository.save(existingPayment);
  }

  private parsePaymentStatus(status: string): PaymentStatus {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING':
        return PaymentStatus.PENDING;
      case 'PROCESSING':
        return PaymentStatus.PROCESSING;
      case 'COMPLETED':
        return PaymentStatus.COMPLETED;
      case 'FAILED':
        return PaymentStatus.FAILED;
      case 'CANCELLED':
        return PaymentStatus.CANCELLED;
      case 'REFUNDED':
        return PaymentStatus.REFUNDED;
      default:
        throw new Error(`Invalid payment status: ${status}`);
    }
  }
}
